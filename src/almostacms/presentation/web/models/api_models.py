"""API request and response models."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class BaseResponse(BaseModel):
    """Base response model."""

    success: bool = Field(..., description="Whether the request was successful")
    message: Optional[str] = Field(None, description="Optional message")
    timestamp: datetime = Field(
        default_factory=datetime.now, description="Response timestamp"
    )


class SuccessResponse(BaseResponse):
    """Generic success response."""

    success: bool = Field(default=True)
    data: Optional[Dict[str, Any]] = Field(None, description="Optional response data")


class ErrorResponse(BaseResponse):
    """Generic error response."""

    success: bool = Field(default=False)
    error_code: Optional[str] = Field(None, description="Error code")
    details: Optional[Dict[str, Any]] = Field(None, description="Error details")


class ValidationErrorResponse(ErrorResponse):
    """Validation error response."""

    error_code: str = Field(default="VALIDATION_ERROR")
    validation_errors: List[Dict[str, str]] = Field(
        ..., description="List of validation errors"
    )


class ContentResponse(BaseResponse):
    """Response model for content operations."""

    success: bool = Field(default=True)
    content: Dict[str, Any] = Field(..., description="Content data")
    content_type: str = Field(..., description="Content type identifier")
    version: int = Field(..., description="Content version")
    commit_hash: Optional[str] = Field(None, description="Git commit hash")


class ContentListResponse(BaseResponse):
    """Response model for content list operations."""

    success: bool = Field(default=True)
    content_types: List[str] = Field(
        ..., description="List of content type identifiers"
    )
    total_count: int = Field(..., description="Total number of content types")


class ContentHistoryResponse(BaseResponse):
    """Response model for content history."""

    success: bool = Field(default=True)
    history: List[Dict[str, Any]] = Field(..., description="Content version history")
    content_type: str = Field(..., description="Content type identifier")
    total_versions: int = Field(..., description="Total number of versions")


class SystemStatusResponse(BaseResponse):
    """Response model for system status."""

    success: bool = Field(default=True)
    status: Dict[str, Any] = Field(..., description="System status information")
    version: str = Field(..., description="Application version")


class BackupResponse(BaseResponse):
    """Response model for backup operations."""

    success: bool = Field(default=True)
    backup_name: Optional[str] = Field(None, description="Backup identifier")
    backup_path: Optional[str] = Field(None, description="Backup file path")


class ContentValidationRequest(BaseModel):
    """Request model for content validation."""

    content_type: str = Field(..., description="Content type identifier")
    data: Dict[str, Any] = Field(..., description="Content data to validate")


class ContentValidationResponse(BaseResponse):
    """Response model for content validation."""

    success: bool = Field(default=True)
    valid: bool = Field(..., description="Whether the content is valid")
    errors: List[str] = Field(
        default_factory=list, description="Validation error messages"
    )
    warnings: List[str] = Field(default_factory=list, description="Validation warnings")
