"""Security service interface for input validation and sanitization."""

from typing import List, Protocol

from fastapi import UploadFile


class SecurityService(Protocol):
    """Abstract security service for validation and sanitization."""

    def validate_content_type(self, content_type: str) -> bool:
        """Validate that content type is allowed.

        Args:
            content_type: Content type identifier to validate

        Returns:
            True if content type is allowed
        """
        ...

    def sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for safe storage.

        Args:
            filename: Original filename

        Returns:
            Sanitized filename safe for file system
        """
        ...

    def validate_file_upload(self, file: UploadFile) -> bool:
        """Validate uploaded file for security.

        Args:
            file: Uploaded file to validate

        Returns:
            True if file is safe to process
        """
        ...

    def sanitize_html_content(self, content: str) -> str:
        """Sanitize HTML content to prevent XSS.

        Args:
            content: Raw HTML content

        Returns:
            Sanitized HTML content
        """
        ...

    def validate_url(self, url: str) -> bool:
        """Validate URL for safety.

        Args:
            url: URL to validate

        Returns:
            True if URL is safe
        """
        ...

    def get_allowed_content_types(self) -> List[str]:
        """Get list of allowed content types.

        Returns:
            List of allowed content type identifiers
        """
        ...
