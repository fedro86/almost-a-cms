"""Content management API routes."""

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from config import settings

from ....domain.services.content_type_registry import content_type_registry
from ....domain.services.form_schema_generator import form_schema_generator
from ....infrastructure.logging import get_logger
from ....infrastructure.security import DefaultSecurityService
from ....infrastructure.storage import FileSystemContentRepository
from ...models.api_models import (
    ContentListResponse,
    ContentResponse,
    ContentValidationRequest,
    ContentValidationResponse,
    ErrorResponse,
    SuccessResponse,
    ValidationErrorResponse,
)

router = APIRouter()
logger = get_logger(__name__)

# Global repository instance (in production, this would be dependency injected)
_repository = None


def get_repository() -> FileSystemContentRepository:
    """Get content repository instance."""
    global _repository
    if _repository is None:
        _repository = FileSystemContentRepository(
            content_directory=settings.content_directory,
            backup_directory=settings.backup_directory,
            security_service=DefaultSecurityService(),
            auto_backup=settings.auto_backup,
        )
    return _repository


def get_security_service() -> DefaultSecurityService:
    """Get security service instance."""
    return DefaultSecurityService()


@router.get("/types", response_model=ContentListResponse)
async def list_content_types(
    repository: FileSystemContentRepository = Depends(get_repository),
) -> ContentListResponse:
    """Get list of all available content types."""
    try:
        content_types = await repository.list_all_types()

        return ContentListResponse(
            message="Content types retrieved successfully",
            content_types=content_types,
            total_count=len(content_types),
        )

    except Exception as e:
        logger.error(f"Failed to list content types: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve content types",
        )


@router.get("/types/registry", response_model=ContentListResponse)
async def list_registered_types() -> ContentListResponse:
    """Get list of all registered content types from registry."""
    try:
        registered_types = content_type_registry.list_content_types()

        return ContentListResponse(
            message="Registered content types retrieved successfully",
            content_types=registered_types,
            total_count=len(registered_types),
        )

    except Exception as e:
        logger.error(f"Failed to list registered content types: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve registered content types",
        )


@router.get("/{content_type}", response_model=ContentResponse)
async def get_content(
    content_type: str,
    repository: FileSystemContentRepository = Depends(get_repository),
    security: DefaultSecurityService = Depends(get_security_service),
) -> ContentResponse:
    """Get content by type."""
    try:
        # Validate content type
        if not security.validate_content_type(content_type):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid content type: {content_type}",
            )

        # Retrieve content
        content = await repository.get(content_type)

        if content is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Content not found for type: {content_type}",
            )

        return ContentResponse(
            message="Content retrieved successfully",
            content=content.dict(),
            content_type=content_type,
            version=content.version,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get content {content_type}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve content",
        )


@router.put("/{content_type}", response_model=ContentResponse)
async def update_content(
    content_type: str,
    content_data: Dict[str, Any],
    repository: FileSystemContentRepository = Depends(get_repository),
    security: DefaultSecurityService = Depends(get_security_service),
) -> ContentResponse:
    """Create or update content."""
    try:
        # Validate content type
        if not security.validate_content_type(content_type):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid content type: {content_type}",
            )

        # Create content instance with validation
        content_instance = content_type_registry.create_content_instance(
            content_type=content_type, data=content_data, validate=True
        )

        if content_instance is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create content instance",
            )

        # Save content
        saved_content = await repository.save(content_instance)

        # Get commit hash from repository status (simplified)
        repo_status = repository.get_repository_status()
        commit_hash = (
            repo_status.get("git_status", {}).get("last_commit", {}).get("hash")
        )

        return ContentResponse(
            message="Content saved successfully",
            content=saved_content.dict(),
            content_type=content_type,
            version=saved_content.version,
            commit_hash=commit_hash,
        )

    except HTTPException:
        raise
    except ValueError as e:
        # Validation error from Pydantic
        logger.warning(f"Content validation failed for {content_type}: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to update content {content_type}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save content",
        )


@router.delete("/{content_type}", response_model=SuccessResponse)
async def delete_content(
    content_type: str,
    repository: FileSystemContentRepository = Depends(get_repository),
    security: DefaultSecurityService = Depends(get_security_service),
) -> SuccessResponse:
    """Delete content by type."""
    try:
        # Validate content type
        if not security.validate_content_type(content_type):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid content type: {content_type}",
            )

        # Delete content
        deleted = await repository.delete(content_type)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Content not found for type: {content_type}",
            )

        return SuccessResponse(
            message=f"Content deleted successfully: {content_type}",
            data={"content_type": content_type},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete content {content_type}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete content",
        )


@router.post("/validate", response_model=ContentValidationResponse)
async def validate_content(
    validation_request: ContentValidationRequest,
    security: DefaultSecurityService = Depends(get_security_service),
) -> ContentValidationResponse:
    """Validate content data without saving."""
    try:
        content_type = validation_request.content_type
        content_data = validation_request.data

        # Validate content type
        if not security.validate_content_type(content_type):
            return ContentValidationResponse(
                message="Invalid content type",
                valid=False,
                errors=[f"Invalid content type: {content_type}"],
            )

        # Validate content data
        is_valid, error_messages = content_type_registry.validate_content_data(
            content_type, content_data
        )

        return ContentValidationResponse(
            message="Content validation completed",
            valid=is_valid,
            errors=error_messages,
        )

    except Exception as e:
        logger.error(f"Failed to validate content: {e}")
        return ContentValidationResponse(
            message="Validation failed due to internal error",
            valid=False,
            errors=[str(e)],
        )


@router.get("/{content_type}/schema")
async def get_content_schema(
    content_type: str, security: DefaultSecurityService = Depends(get_security_service)
) -> Dict[str, Any]:
    """Get JSON schema for content type."""
    try:
        # Validate content type
        if not security.validate_content_type(content_type):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid content type: {content_type}",
            )

        # Get schema
        schema = content_type_registry.get_content_schema(content_type)

        if schema is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Schema not found for content type: {content_type}",
            )

        return {
            "success": True,
            "message": "Schema retrieved successfully",
            "content_type": content_type,
            "schema": schema,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get schema for {content_type}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve schema",
        )


@router.get("/{content_type}/info")
async def get_content_type_info(
    content_type: str, security: DefaultSecurityService = Depends(get_security_service)
) -> Dict[str, Any]:
    """Get detailed information about a content type."""
    try:
        # Validate content type
        if not security.validate_content_type(content_type):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid content type: {content_type}",
            )

        # Get content type info
        info = content_type_registry.get_content_type_info(content_type)

        if info is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Content type not found: {content_type}",
            )

        return {
            "success": True,
            "message": "Content type information retrieved successfully",
            "info": info,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get info for {content_type}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve content type information",
        )


@router.get("/{content_type}/form-schema")
async def get_content_form_schema(
    content_type: str, security: DefaultSecurityService = Depends(get_security_service)
) -> Dict[str, Any]:
    """Get form schema for content type to generate dynamic forms."""
    try:
        # Validate content type
        if not security.validate_content_type(content_type):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid content type: {content_type}",
            )

        # Get the model class for this content type
        model_class = content_type_registry.get_content_type_class(content_type)

        if model_class is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Model not found for content type: {content_type}",
            )

        # Generate form schema
        form_schema = form_schema_generator.generate_form_schema(model_class)

        return {
            "success": True,
            "message": "Form schema retrieved successfully",
            "content_type": content_type,
            "form_schema": form_schema,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get form schema for {content_type}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve form schema",
        )
