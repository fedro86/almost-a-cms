"""System management API routes."""

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status

from config import settings

from ....infrastructure.logging import get_logger
from ....infrastructure.storage import FileSystemContentRepository
from ...models.api_models import BackupResponse, SuccessResponse, SystemStatusResponse

router = APIRouter()
logger = get_logger(__name__)


def get_repository() -> FileSystemContentRepository:
    """Get content repository instance."""
    from .content import get_repository

    return get_repository()


@router.get("/status", response_model=SystemStatusResponse)
async def get_system_status(
    repository: FileSystemContentRepository = Depends(get_repository),
) -> SystemStatusResponse:
    """Get comprehensive system status."""
    try:
        # Get repository status
        repo_status = repository.get_repository_status()

        # Build system status
        system_status = {
            "application": {
                "name": settings.app_name,
                "version": settings.app_version,
                "environment": settings.environment,
                "debug_mode": settings.debug,
            },
            "directories": {
                "content": str(settings.content_directory),
                "media": str(settings.media_directory),
                "templates": str(settings.template_directory),
                "backups": str(settings.backup_directory),
            },
            "repository": repo_status,
            "features": {
                "auto_backup": settings.auto_backup,
                "content_versioning": settings.content_versioning,
                "csrf_protection": True,
                "security_headers": True,
            },
            "limits": {
                "max_file_size": settings.max_file_size,
                "max_image_width": settings.max_image_width,
                "max_image_height": settings.max_image_height,
            },
        }

        return SystemStatusResponse(
            message="System status retrieved successfully",
            status=system_status,
            version=settings.app_version,
        )

    except Exception as e:
        logger.error(f"Failed to get system status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve system status",
        )


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Simple health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "timestamp": "2025-09-25T00:00:00Z",  # This would be current time in real app
    }


@router.post("/backup", response_model=BackupResponse)
async def create_backup(
    backup_name: str = None,
    repository: FileSystemContentRepository = Depends(get_repository),
) -> BackupResponse:
    """Create a manual backup of all content."""
    try:
        success = await repository.backup(backup_name or "manual")

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create backup",
            )

        return BackupResponse(
            message="Backup created successfully",
            backup_name=backup_name,
            backup_path=str(settings.backup_directory),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create backup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create backup",
        )


@router.get("/backups")
async def list_backups(
    repository: FileSystemContentRepository = Depends(get_repository),
) -> Dict[str, Any]:
    """List available backups."""
    try:
        backup_status = repository.backup_manager.get_backup_status()
        backups = backup_status.get("recent_backups", [])

        return {
            "success": True,
            "message": "Backups listed successfully",
            "backups": backups,
            "total_count": backup_status.get("total_backups", 0),
            "auto_backup_enabled": backup_status.get("auto_backup_enabled", False),
        }

    except Exception as e:
        logger.error(f"Failed to list backups: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list backups",
        )


@router.post("/backups/{backup_name}/restore", response_model=SuccessResponse)
async def restore_backup(
    backup_name: str, repository: FileSystemContentRepository = Depends(get_repository)
) -> SuccessResponse:
    """Restore content from a specific backup."""
    try:
        success = await repository.restore(backup_name)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Backup not found or restore failed: {backup_name}",
            )

        return SuccessResponse(
            message=f"Content restored successfully from backup: {backup_name}",
            data={"backup_name": backup_name},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to restore backup {backup_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to restore backup",
        )


@router.get("/config")
async def get_configuration() -> Dict[str, Any]:
    """Get current configuration (non-sensitive values only)."""
    try:
        config = {
            "app_name": settings.app_name,
            "app_version": settings.app_version,
            "environment": settings.environment,
            "debug": settings.debug,
            "default_theme": settings.default_theme,
            "auto_backup": settings.auto_backup,
            "content_versioning": settings.content_versioning,
            "site_title": settings.site_title,
            "site_description": settings.site_description,
            "max_file_size": settings.max_file_size,
            "max_image_width": settings.max_image_width,
            "max_image_height": settings.max_image_height,
        }

        return {
            "success": True,
            "message": "Configuration retrieved successfully",
            "config": config,
        }

    except Exception as e:
        logger.error(f"Failed to get configuration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve configuration",
        )
