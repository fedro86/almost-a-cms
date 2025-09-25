"""Abstract interface for content repository operations."""

from typing import List, Optional, Protocol

from ..models.base import BaseContent


class ContentRepository(Protocol):
    """Abstract repository for content operations."""

    async def get(self, content_type: str, content_id: str) -> Optional[BaseContent]:
        """Retrieve content by type and ID.

        Args:
            content_type: Type of content (e.g., 'personal_info', 'about')
            content_id: Unique identifier for the content

        Returns:
            Content object if found, None otherwise
        """
        ...

    async def save(self, content: BaseContent) -> BaseContent:
        """Save or update content.

        Args:
            content: Content object to save

        Returns:
            Saved content object with updated metadata
        """
        ...

    async def delete(self, content_type: str, content_id: str) -> bool:
        """Delete content by type and ID.

        Args:
            content_type: Type of content
            content_id: Unique identifier for the content

        Returns:
            True if deleted successfully, False if not found
        """
        ...

    async def list_by_type(self, content_type: str) -> List[BaseContent]:
        """List all content of a specific type.

        Args:
            content_type: Type of content to list

        Returns:
            List of content objects
        """
        ...

    async def list_all_types(self) -> List[str]:
        """Get list of all available content types.

        Returns:
            List of content type identifiers
        """
        ...

    async def backup(self, backup_path: str) -> bool:
        """Create backup of all content.

        Args:
            backup_path: Path to store backup

        Returns:
            True if backup created successfully
        """
        ...

    async def restore(self, backup_path: str) -> bool:
        """Restore content from backup.

        Args:
            backup_path: Path to backup to restore from

        Returns:
            True if restored successfully
        """
        ...
