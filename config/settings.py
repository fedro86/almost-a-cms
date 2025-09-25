"""Application configuration settings."""

from pathlib import Path
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration."""

    # Application
    app_name: str = Field(default="Almost-a-CMS", description="Application name")
    app_version: str = Field(default="2.0.0-dev", description="Application version")
    debug: bool = Field(default=False, description="Debug mode")
    environment: str = Field(default="development", description="Environment")

    # Server
    host: str = Field(default="127.0.0.1", description="Server host")
    port: int = Field(default=8000, description="Server port")
    reload: bool = Field(default=True, description="Auto-reload on changes")

    # Security
    secret_key: str = Field(
        default="your-secret-key-change-in-production",
        description="Secret key for JWT tokens",
    )
    algorithm: str = Field(default="HS256", description="JWT algorithm")
    access_token_expire_minutes: int = Field(
        default=30, description="Access token expiration"
    )
    allowed_origins: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        description="CORS allowed origins",
    )

    # Paths
    content_directory: Path = Field(
        default=Path("data"), description="Content storage directory"
    )
    media_directory: Path = Field(
        default=Path("media"), description="Media storage directory"
    )
    template_directory: Path = Field(
        default=Path("templates"), description="Template directory"
    )
    theme_directory: Path = Field(default=Path("themes"), description="Theme directory")
    backup_directory: Path = Field(
        default=Path("backups"), description="Backup directory"
    )
    static_directory: Path = Field(
        default=Path("static"), description="Static files directory"
    )

    # File limits
    max_file_size: int = Field(
        default=10 * 1024 * 1024, description="Maximum file size in bytes"
    )
    max_image_width: int = Field(
        default=2000, description="Maximum image width in pixels"
    )
    max_image_height: int = Field(
        default=2000, description="Maximum image height in pixels"
    )

    # Content settings
    default_theme: str = Field(default="default", description="Default theme name")
    auto_backup: bool = Field(default=True, description="Enable automatic backups")
    content_versioning: bool = Field(
        default=True, description="Enable content versioning"
    )

    # Site generation
    site_title: str = Field(default="My Portfolio", description="Default site title")
    site_description: str = Field(
        default="A beautiful portfolio website", description="Default site description"
    )
    site_url: Optional[str] = Field(None, description="Site URL for absolute links")

    class Config:
        """Pydantic configuration."""

        env_file = ".env"
        env_prefix = "ALMOSTACMS_"
        case_sensitive = False

    def __init__(self, **kwargs):
        """Initialize settings and ensure directories exist."""
        super().__init__(**kwargs)
        self._ensure_directories()

    @property
    def media_dir(self) -> Path:
        """Get media directory path."""
        return self.media_directory

    @property
    def content_dir(self) -> Path:
        """Get content directory path."""
        return self.content_directory

    def _ensure_directories(self) -> None:
        """Ensure all required directories exist."""
        directories = [
            self.content_directory,
            self.media_directory,
            self.template_directory,
            self.theme_directory,
            self.backup_directory,
            self.static_directory,
        ]

        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get the global settings instance."""
    return settings
