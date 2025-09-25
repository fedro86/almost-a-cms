"""Base models and common types for the domain layer."""

from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, HttpUrl, validator


class BaseContent(BaseModel):
    """Base class for all content types with common metadata."""

    id: str = Field(
        default_factory=lambda: str(uuid4()), description="Unique identifier"
    )
    created_at: datetime = Field(
        default_factory=datetime.now, description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, description="Last modification timestamp"
    )
    version: int = Field(default=1, ge=1, description="Content version number")
    published: bool = Field(default=True, description="Whether content is published")
    content_type: str = Field(
        ..., description="Type of content (auto-set by subclasses)"
    )

    class Config:
        """Pydantic configuration."""

        json_encoders = {datetime: lambda dt: dt.isoformat()}
        validate_assignment = True
        use_enum_values = True

    def __init_subclass__(cls, **kwargs: Any) -> None:
        """Auto-set content_type based on class name."""
        super().__init_subclass__(**kwargs)
        # Convert CamelCase to snake_case for content_type
        cls.__fields__["content_type"].default = cls._class_name_to_content_type(
            cls.__name__
        )

    @staticmethod
    def _class_name_to_content_type(class_name: str) -> str:
        """Convert class name to content type identifier."""
        # Convert CamelCase to snake_case
        import re

        s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", class_name)
        result = re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).lower()
        # Remove 'content' suffix if present
        return result.replace("_content", "")

    def update_version(self) -> None:
        """Update version and timestamp."""
        self.version += 1
        self.updated_at = datetime.now()

    def to_dict(self, exclude_metadata: bool = False) -> Dict[str, Any]:
        """Convert to dictionary, optionally excluding metadata."""
        data = self.dict()
        if exclude_metadata:
            metadata_fields = {
                "id",
                "created_at",
                "updated_at",
                "version",
                "content_type",
            }
            data = {k: v for k, v in data.items() if k not in metadata_fields}
        return data


class MediaFile(BaseModel):
    """Represents an uploaded media file with metadata."""

    filename: str = Field(..., min_length=1, max_length=255, description="File name")
    original_filename: str = Field(
        ..., min_length=1, max_length=255, description="Original uploaded filename"
    )
    file_path: str = Field(..., description="Relative path to file")
    size: int = Field(..., gt=0, description="File size in bytes")
    mime_type: str = Field(..., description="MIME type of the file")
    width: Optional[int] = Field(None, gt=0, description="Image width in pixels")
    height: Optional[int] = Field(None, gt=0, description="Image height in pixels")
    alt_text: Optional[str] = Field(
        None, max_length=255, description="Alt text for accessibility"
    )
    caption: Optional[str] = Field(None, max_length=500, description="Image caption")
    tags: List[str] = Field(default_factory=list, description="Tags for organization")
    uploaded_at: datetime = Field(
        default_factory=datetime.now, description="Upload timestamp"
    )

    @validator("mime_type")
    def validate_mime_type(cls, v: str) -> str:
        """Validate that mime type is supported."""
        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/svg+xml",
            "image/gif",
        }
        if v not in allowed_types:
            raise ValueError(f"Unsupported mime type: {v}. Allowed: {allowed_types}")
        return v

    @validator("filename", "original_filename")
    def validate_filename(cls, v: str) -> str:
        """Validate filename for security."""
        # Remove dangerous characters and limit length
        import re

        safe_chars = re.sub(r"[^\w\-_\.]", "_", v)
        if len(safe_chars) > 100:
            name, ext = (
                safe_chars.rsplit(".", 1) if "." in safe_chars else (safe_chars, "")
            )
            safe_chars = name[:95] + ("." + ext if ext else "")
        return safe_chars

    @validator("tags")
    def validate_tags(cls, v: List[str]) -> List[str]:
        """Validate and clean tags."""
        # Remove empty tags and limit count
        clean_tags = [tag.strip() for tag in v if tag.strip()]
        return clean_tags[:20]  # Limit to 20 tags

    @property
    def is_image(self) -> bool:
        """Check if file is an image."""
        return self.mime_type.startswith("image/")

    @property
    def file_extension(self) -> str:
        """Get file extension."""
        return Path(self.filename).suffix.lower()

    def get_thumbnail_path(self, size: str = "medium") -> str:
        """Get path to thumbnail version of image."""
        if not self.is_image:
            return self.file_path

        name = Path(self.filename).stem
        ext = self.file_extension
        return f"media/thumbnails/{name}_{size}{ext}"


class SocialLink(BaseModel):
    """Represents a social media link."""

    platform: str = Field(..., min_length=1, max_length=50, description="Platform name")
    url: HttpUrl = Field(..., description="Profile URL")
    username: Optional[str] = Field(
        None, max_length=100, description="Username on platform"
    )
    icon: Optional[str] = Field(None, max_length=100, description="Icon identifier")
    display_text: Optional[str] = Field(
        None, max_length=100, description="Custom display text"
    )

    @validator("platform")
    def validate_platform(cls, v: str) -> str:
        """Normalize platform name."""
        return v.lower().strip()


class ContactInfo(BaseModel):
    """Contact information fields."""

    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    location: Optional[str] = Field(None, max_length=200, description="Location")
    website: Optional[HttpUrl] = Field(None, description="Website URL")

    @validator("email")
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        """Validate email format."""
        if not v:
            return v

        import re

        email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_regex, v):
            raise ValueError("Invalid email format")
        return v.lower()

    @validator("phone")
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        """Validate phone number format."""
        if not v:
            return v

        import re

        # Allow various phone formats
        phone_regex = r"^\+?[\d\s\-\(\)\.]{7,20}$"
        if not re.match(phone_regex, v):
            raise ValueError("Invalid phone number format")
        return v


class SEOData(BaseModel):
    """SEO metadata for content."""

    meta_title: Optional[str] = Field(None, max_length=60, description="Page title")
    meta_description: Optional[str] = Field(
        None, max_length=160, description="Meta description"
    )
    keywords: List[str] = Field(default_factory=list, description="SEO keywords")
    og_image: Optional[MediaFile] = Field(None, description="Open Graph image")
    canonical_url: Optional[HttpUrl] = Field(None, description="Canonical URL")

    @validator("keywords")
    def validate_keywords(cls, v: List[str]) -> List[str]:
        """Validate and clean keywords."""
        # Remove duplicates and empty keywords, limit count
        clean_keywords = list(set(kw.strip().lower() for kw in v if kw.strip()))
        return clean_keywords[:10]  # Limit to 10 keywords
