"""Media management API endpoints."""

import io
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from almostacms.domain.services.media_processor import MediaProcessor
from almostacms.infrastructure.logging import get_logger
from almostacms.infrastructure.security import DefaultSecurityService

logger = get_logger(__name__)
router = APIRouter(tags=["media"])


def get_media_processor() -> MediaProcessor:
    """Get media processor instance."""
    return MediaProcessor()


def get_security_service() -> DefaultSecurityService:
    """Get security service instance."""
    return DefaultSecurityService()


@router.post("/upload")
async def upload_media(
    file: UploadFile = File(...),
    media_processor: MediaProcessor = Depends(get_media_processor),
    security_service: DefaultSecurityService = Depends(get_security_service),
) -> Dict[str, Any]:
    """
    Upload a media file.

    Args:
        file: Uploaded file
        media_processor: Media processor service
        security_service: Security service

    Returns:
        Dictionary with upload results

    Raises:
        HTTPException: If upload fails
    """
    try:
        # Validate filename
        if not security_service.validate_filename(file.filename or ""):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid filename"
            )

        # Read file content
        content = await file.read()

        # Process the file
        media_file = media_processor.process_image(content, file.filename or "upload")

        logger.info(f"Successfully uploaded media file: {media_file.filename}")

        return {
            "success": True,
            "message": "File uploaded successfully",
            "data": media_file.to_dict(),
        }

    except ValueError as e:
        logger.warning(f"Media upload validation error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    except Exception as e:
        logger.error(f"Media upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file",
        )


@router.post("/upload-multiple")
async def upload_multiple_media(
    files: List[UploadFile] = File(...),
    media_processor: MediaProcessor = Depends(get_media_processor),
    security_service: DefaultSecurityService = Depends(get_security_service),
) -> Dict[str, Any]:
    """
    Upload multiple media files.

    Args:
        files: List of uploaded files
        media_processor: Media processor service
        security_service: Security service

    Returns:
        Dictionary with upload results

    Raises:
        HTTPException: If upload fails
    """
    if len(files) > 10:  # Limit bulk uploads
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many files. Maximum 10 files per upload.",
        )

    results = []
    errors = []

    for file in files:
        try:
            # Validate filename
            if not security_service.validate_filename(file.filename or ""):
                errors.append({"filename": file.filename, "error": "Invalid filename"})
                continue

            # Read file content
            content = await file.read()

            # Process the file
            media_file = media_processor.process_image(
                content, file.filename or "upload"
            )

            results.append(media_file.to_dict())
            logger.info(f"Successfully uploaded media file: {media_file.filename}")

        except ValueError as e:
            errors.append({"filename": file.filename, "error": str(e)})
            logger.warning(
                f"Media upload validation error for {file.filename}: {str(e)}"
            )

        except Exception as e:
            errors.append({"filename": file.filename, "error": "Processing failed"})
            logger.error(f"Media upload error for {file.filename}: {str(e)}")

    return {
        "success": len(results) > 0,
        "message": f"Processed {len(results)} files successfully, {len(errors)} errors",
        "data": {"uploaded": results, "errors": errors},
    }


@router.get("/list")
async def list_media(
    media_processor: MediaProcessor = Depends(get_media_processor),
) -> Dict[str, Any]:
    """
    List all media files.

    Args:
        media_processor: Media processor service

    Returns:
        Dictionary with media file list
    """
    try:
        media_files = media_processor.list_media_files()

        return {
            "success": True,
            "message": f"Found {len(media_files)} media files",
            "data": media_files,
        }

    except Exception as e:
        logger.error(f"Error listing media files: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list media files",
        )


@router.get("/file/{filename}")
async def get_media_file(
    filename: str,
    size: str = None,
    media_processor: MediaProcessor = Depends(get_media_processor),
    security_service: DefaultSecurityService = Depends(get_security_service),
) -> FileResponse:
    """
    Get a media file.

    Args:
        filename: Media filename
        size: Size variant (thumbnail, small, medium, large)
        media_processor: Media processor service
        security_service: Security service

    Returns:
        FileResponse with media file

    Raises:
        HTTPException: If file not found or invalid
    """
    try:
        # Validate filename
        if not security_service.validate_filename(filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid filename"
            )

        # Get file path
        if size and size in media_processor.SIZES:
            # Get size variant
            size_dir = media_processor.media_dir / size
            base_name = filename.split(".")[0]
            size_filename = f"{base_name}_{size}.webp"
            file_path = size_dir / size_filename
        else:
            # Get original file
            file_path = media_processor.media_dir / filename

        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
            )

        # Return file
        return FileResponse(
            path=str(file_path),
            media_type=media_processor._get_mime_type(file_path.suffix),
            filename=file_path.name,
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error serving media file {filename}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serve file",
        )


@router.delete("/file/{filename}")
async def delete_media_file(
    filename: str,
    media_processor: MediaProcessor = Depends(get_media_processor),
    security_service: DefaultSecurityService = Depends(get_security_service),
) -> Dict[str, Any]:
    """
    Delete a media file.

    Args:
        filename: Media filename
        media_processor: Media processor service
        security_service: Security service

    Returns:
        Dictionary with deletion result

    Raises:
        HTTPException: If deletion fails
    """
    try:
        # Validate filename
        if not security_service.validate_filename(filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid filename"
            )

        # Delete file
        success = media_processor.delete_media_file(filename)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found or deletion failed",
            )

        return {"success": True, "message": f"File {filename} deleted successfully"}

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error deleting media file {filename}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete file",
        )


@router.get("/info/{filename}")
async def get_media_info(
    filename: str,
    media_processor: MediaProcessor = Depends(get_media_processor),
    security_service: DefaultSecurityService = Depends(get_security_service),
) -> Dict[str, Any]:
    """
    Get information about a media file.

    Args:
        filename: Media filename
        media_processor: Media processor service
        security_service: Security service

    Returns:
        Dictionary with file information

    Raises:
        HTTPException: If file not found
    """
    try:
        # Validate filename
        if not security_service.validate_filename(filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid filename"
            )

        # Get file info from media list
        media_files = media_processor.list_media_files()
        file_info = next((f for f in media_files if f["filename"] == filename), None)

        if not file_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
            )

        # Add available sizes
        available_sizes = []
        for size_name in media_processor.SIZES:
            size_dir = media_processor.media_dir / size_name
            base_name = filename.split(".")[0]
            size_filename = f"{base_name}_{size_name}.webp"
            size_path = size_dir / size_filename
            if size_path.exists():
                available_sizes.append(
                    {
                        "name": size_name,
                        "url": media_processor.get_media_url(filename, size_name),
                        "dimensions": media_processor.SIZES[size_name],
                    }
                )

        file_info["available_sizes"] = available_sizes

        return {
            "success": True,
            "message": "File information retrieved successfully",
            "data": file_info,
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error getting media file info for {filename}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get file information",
        )
