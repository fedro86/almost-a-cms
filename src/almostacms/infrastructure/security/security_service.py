"""Default implementation of security service."""

import re
from pathlib import Path
from typing import List, Set

from fastapi import UploadFile


class DefaultSecurityService:
    """Default security service implementation."""

    # Allowed content types for the CMS
    ALLOWED_CONTENT_TYPES: Set[str] = {
        "personal_info",
        "about",
        "resume",
        "portfolio",
        "blog",
        "contact",
        "navigation",
    }

    # Allowed file types for uploads
    ALLOWED_FILE_TYPES: Set[str] = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/svg+xml",
        "image/gif",
        "application/pdf",  # For resume files
    }

    # Maximum file sizes by type (in bytes)
    MAX_FILE_SIZES = {
        "image/jpeg": 10 * 1024 * 1024,  # 10MB
        "image/png": 10 * 1024 * 1024,  # 10MB
        "image/webp": 10 * 1024 * 1024,  # 10MB
        "image/svg+xml": 2 * 1024 * 1024,  # 2MB
        "image/gif": 5 * 1024 * 1024,  # 5MB
        "application/pdf": 20 * 1024 * 1024,  # 20MB
    }

    # Dangerous filename patterns to reject
    DANGEROUS_PATTERNS = [
        r"\.\./",  # Directory traversal
        r"\.\.\\",  # Windows directory traversal
        r"^\.ht",  # .htaccess files
        r"\.php$",  # PHP files
        r"\.exe$",  # Executable files
        r"\.bat$",  # Batch files
        r"\.cmd$",  # Command files
        r"\.sh$",  # Shell scripts
        r"\.jsp$",  # JSP files
        r"\.asp$",  # ASP files
        r"null",  # Null bytes
        r"con|prn|aux|nul|com[1-9]|lpt[1-9]",  # Windows reserved names
    ]

    def validate_content_type(self, content_type: str) -> bool:
        """Validate that content type is allowed."""
        return content_type.lower().strip() in self.ALLOWED_CONTENT_TYPES

    def sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for safe storage."""
        if not filename:
            raise ValueError("Filename cannot be empty")

        # Convert to lowercase for consistency
        safe_filename = filename.lower().strip()

        # Check for dangerous patterns
        for pattern in self.DANGEROUS_PATTERNS:
            if re.search(pattern, safe_filename, re.IGNORECASE):
                raise ValueError(f"Filename contains dangerous pattern: {pattern}")

        # Remove any non-alphanumeric characters except dots, hyphens, underscores
        safe_filename = re.sub(r"[^\w\.-]", "_", safe_filename)

        # Remove consecutive underscores/dots
        safe_filename = re.sub(r"[_.]{2,}", "_", safe_filename)

        # Ensure filename isn't too long
        if len(safe_filename) > 100:
            name, ext = (
                safe_filename.rsplit(".", 1)
                if "." in safe_filename
                else (safe_filename, "")
            )
            safe_filename = name[:95] + ("." + ext if ext else "")

        # Ensure filename isn't empty after sanitization
        if not safe_filename or safe_filename.startswith("."):
            raise ValueError("Invalid filename after sanitization")

        return safe_filename

    def validate_file_upload(self, file: UploadFile) -> bool:
        """Validate uploaded file for security."""
        if not file.filename:
            return False

        # Check file type
        if file.content_type not in self.ALLOWED_FILE_TYPES:
            return False

        # Check file size
        max_size = self.MAX_FILE_SIZES.get(file.content_type, 5 * 1024 * 1024)
        if file.size and file.size > max_size:
            return False

        # Validate filename
        try:
            self.sanitize_filename(file.filename)
        except ValueError:
            return False

        return True

    def sanitize_html_content(self, content: str) -> str:
        """Sanitize HTML content to prevent XSS."""
        if not content:
            return content

        # For now, we'll escape HTML entities
        # In a full implementation, we'd use a library like bleach
        import html

        return html.escape(content)

    def validate_url(self, url: str) -> bool:
        """Validate URL for safety."""
        if not url:
            return True  # Empty URLs are OK

        # Check for dangerous schemes
        dangerous_schemes = ["javascript:", "data:", "vbscript:", "file:"]
        url_lower = url.lower().strip()

        for scheme in dangerous_schemes:
            if url_lower.startswith(scheme):
                return False

        # Must start with http, https, or be relative
        if not (
            url_lower.startswith(("http://", "https://"))
            or url.startswith(("/", "#", "?"))
        ):
            return False

        return True

    def get_allowed_content_types(self) -> List[str]:
        """Get list of allowed content types."""
        return sorted(list(self.ALLOWED_CONTENT_TYPES))

    def validate_content_id(self, content_id: str) -> bool:
        """Validate content ID for safety."""
        if not content_id:
            return False

        # Content ID should be alphanumeric with hyphens/underscores
        pattern = r"^[a-zA-Z0-9_-]+$"
        return bool(re.match(pattern, content_id)) and len(content_id) <= 100

    def generate_safe_slug(self, text: str) -> str:
        """Generate a URL-safe slug from text."""
        if not text:
            return "untitled"

        # Convert to lowercase and replace spaces with hyphens
        slug = text.lower().strip()
        slug = re.sub(r"[^\w\s-]", "", slug)  # Remove special chars
        slug = re.sub(r"[-\s]+", "-", slug)  # Replace spaces/hyphens with single hyphen

        # Remove leading/trailing hyphens
        slug = slug.strip("-")

        # Limit length
        return slug[:100] if slug else "untitled"
