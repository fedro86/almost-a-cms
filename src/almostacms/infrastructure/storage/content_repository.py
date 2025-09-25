"""File-based content repository implementation."""

import json
from pathlib import Path
from typing import List, Optional

from ...domain.interfaces.content_repository import ContentRepository
from ...domain.models.base import BaseContent
from ...domain.services.content_type_registry import content_type_registry
from ..logging import get_logger, log_operation
from ..security import DefaultSecurityService
from .backup_manager import BackupManager

logger = get_logger(__name__)


class FileSystemContentRepository:
    """File-based content repository with Git versioning and backup support."""

    def __init__(
        self,
        content_directory: Path,
        backup_directory: Path,
        security_service: Optional[DefaultSecurityService] = None,
        auto_backup: bool = True,
    ):
        """Initialize file system content repository.

        Args:
            content_directory: Directory to store content files
            backup_directory: Directory for backups
            security_service: Security service for validation
            auto_backup: Whether to create automatic backups
        """
        self.content_directory = Path(content_directory)
        self.backup_directory = Path(backup_directory)
        self.security_service = security_service or DefaultSecurityService()

        # Ensure directories exist
        self.content_directory.mkdir(parents=True, exist_ok=True)
        self.backup_directory.mkdir(parents=True, exist_ok=True)

        # Initialize backup manager
        self.backup_manager = BackupManager(
            content_directory=self.content_directory,
            backup_directory=self.backup_directory,
            auto_backup=auto_backup,
        )

        # Initialize content type registry
        content_type_registry.initialize()

        logger.info(
            "File system content repository initialized",
            extra={
                "content_directory": str(self.content_directory),
                "backup_directory": str(self.backup_directory),
                "auto_backup": auto_backup,
            },
        )

    def _get_file_path(self, content_type: str, content_id: str = None) -> Path:
        """Get file path for content type.

        Args:
            content_type: Content type identifier
            content_id: Optional content ID (defaults to content_type)

        Returns:
            Path to content file
        """
        # For now, use simple file naming: {content_type}.json
        # Later can be extended for multiple instances: {content_type}_{content_id}.json
        filename = f"{content_type}.json"
        return self.content_directory / filename

    def _load_json_file(self, file_path: Path) -> Optional[dict]:
        """Load JSON data from file.

        Args:
            file_path: Path to JSON file

        Returns:
            Loaded data or None if file doesn't exist or is invalid
        """
        try:
            if not file_path.exists():
                return None

            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            logger.debug(f"Loaded JSON file: {file_path}")
            return data

        except (json.JSONDecodeError, IOError) as e:
            logger.error(
                f"Failed to load JSON file: {file_path}",
                extra={"file_path": str(file_path), "error": str(e)},
            )
            return None

    def _save_json_file(self, file_path: Path, data: dict) -> bool:
        """Save data to JSON file.

        Args:
            file_path: Path to save file
            data: Data to save

        Returns:
            True if successful
        """
        try:
            # Ensure parent directory exists
            file_path.parent.mkdir(parents=True, exist_ok=True)

            # Write JSON with pretty formatting
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            logger.debug(f"Saved JSON file: {file_path}")
            return True

        except (IOError, TypeError) as e:
            logger.error(
                f"Failed to save JSON file: {file_path}",
                extra={"file_path": str(file_path), "error": str(e)},
            )
            return False

    @log_operation("get_content")
    async def get(
        self, content_type: str, content_id: str = None
    ) -> Optional[BaseContent]:
        """Retrieve content by type and ID.

        Args:
            content_type: Type of content
            content_id: Content identifier (defaults to content_type)

        Returns:
            Content object if found, None otherwise
        """
        try:
            # Validate content type
            if not self.security_service.validate_content_type(content_type):
                logger.warning(f"Invalid content type: {content_type}")
                return None

            # Get file path
            file_path = self._get_file_path(content_type, content_id)

            # Load JSON data
            data = self._load_json_file(file_path)
            if data is None:
                return None

            # Create content instance
            content_instance = content_type_registry.create_content_instance(
                content_type=content_type, data=data, validate=True
            )

            if content_instance:
                logger.debug(
                    f"Retrieved content: {content_type}",
                    extra={"content_type": content_type, "content_id": content_id},
                )

            return content_instance

        except Exception as e:
            logger.error(
                f"Failed to get content: {e}",
                extra={"content_type": content_type, "content_id": content_id},
            )
            return None

    @log_operation("save_content")
    async def save(self, content: BaseContent) -> BaseContent:
        """Save or update content with automatic backup and versioning.

        Args:
            content: Content object to save

        Returns:
            Saved content object with updated metadata
        """
        try:
            content_type = content.content_type
            content_id = getattr(content, "id", content_type)

            # Validate content type
            if not self.security_service.validate_content_type(content_type):
                raise ValueError(f"Invalid content type: {content_type}")

            # Update metadata
            content.update_version()

            # Convert to dictionary for storage
            content_data = content.dict()

            # Save with backup manager (includes Git versioning)
            commit_hash = self.backup_manager.save_with_backup(
                content_type=content_type,
                content_id=content_id,
                content_data=content_data,
                operation_name=f"save_{content_type}",
            )

            if commit_hash is None:
                raise RuntimeError("Failed to save content with backup")

            logger.info(
                f"Content saved successfully: {content_type}",
                extra={
                    "content_type": content_type,
                    "content_id": content_id,
                    "version": content.version,
                    "commit_hash": commit_hash,
                },
            )

            return content

        except Exception as e:
            logger.error(
                f"Failed to save content: {e}",
                extra={"content_type": getattr(content, "content_type", "unknown")},
            )
            raise

    @log_operation("delete_content")
    async def delete(self, content_type: str, content_id: str = None) -> bool:
        """Delete content by type and ID.

        Args:
            content_type: Type of content
            content_id: Content identifier

        Returns:
            True if deleted successfully, False if not found
        """
        try:
            # Validate content type
            if not self.security_service.validate_content_type(content_type):
                logger.warning(f"Invalid content type: {content_type}")
                return False

            # Start backup operation
            operation_name = f"delete_{content_type}"
            backup_name = self.backup_manager.start_operation(operation_name)

            try:
                # Get file path
                file_path = self._get_file_path(content_type, content_id)

                if not file_path.exists():
                    logger.warning(f"Content file not found: {file_path}")
                    self.backup_manager.complete_operation(success=True)
                    return False

                # Delete file
                file_path.unlink()

                # Commit deletion to git
                commit_hash = self.backup_manager.version_manager.git_repo.commit(
                    f"Delete {content_type} content"
                )

                self.backup_manager.complete_operation(success=True)

                logger.info(
                    f"Content deleted successfully: {content_type}",
                    extra={
                        "content_type": content_type,
                        "content_id": content_id,
                        "file_path": str(file_path),
                        "commit_hash": commit_hash,
                        "backup_name": backup_name,
                    },
                )

                return True

            except Exception as e:
                logger.error(f"Error during deletion: {e}")
                self.backup_manager.rollback_operation(f"Delete error: {str(e)}")
                return False

        except Exception as e:
            logger.error(
                f"Failed to delete content: {e}",
                extra={"content_type": content_type, "content_id": content_id},
            )
            return False

    @log_operation("list_content_by_type")
    async def list_by_type(self, content_type: str) -> List[BaseContent]:
        """List all content of a specific type.

        Args:
            content_type: Type of content to list

        Returns:
            List of content objects
        """
        try:
            # Validate content type
            if not self.security_service.validate_content_type(content_type):
                logger.warning(f"Invalid content type: {content_type}")
                return []

            # For now, we only support one instance per content type
            # This can be extended later for multiple instances
            content = await self.get(content_type)
            return [content] if content else []

        except Exception as e:
            logger.error(
                f"Failed to list content by type: {e}",
                extra={"content_type": content_type},
            )
            return []

    async def list_all_types(self) -> List[str]:
        """Get list of all available content types.

        Returns:
            List of content type identifiers
        """
        try:
            # Get registered content types from registry
            registered_types = content_type_registry.list_content_types()

            # Filter by existing files
            existing_types = []
            for content_type in registered_types:
                file_path = self._get_file_path(content_type)
                if file_path.exists():
                    existing_types.append(content_type)

            logger.debug(
                f"Found {len(existing_types)} existing content types",
                extra={"existing_types": existing_types},
            )

            return existing_types

        except Exception as e:
            logger.error(f"Failed to list all content types: {e}")
            return []

    @log_operation("backup_content")
    async def backup(self, backup_path: str) -> bool:
        """Create backup of all content.

        Args:
            backup_path: Path to store backup

        Returns:
            True if backup created successfully
        """
        try:
            backup_name = self.backup_manager.create_manual_backup(backup_path)
            success = backup_name is not None

            if success:
                logger.info(
                    "Manual backup created successfully",
                    extra={"backup_name": backup_name, "backup_path": backup_path},
                )

            return success

        except Exception as e:
            logger.error(f"Failed to create backup: {e}")
            return False

    @log_operation("restore_content")
    async def restore(self, backup_path: str) -> bool:
        """Restore content from backup.

        Args:
            backup_path: Path to backup to restore from

        Returns:
            True if restored successfully
        """
        try:
            success = self.backup_manager.restore_from_backup(backup_path)

            if success:
                logger.info(
                    "Content restored from backup", extra={"backup_path": backup_path}
                )

            return success

        except Exception as e:
            logger.error(f"Failed to restore from backup: {e}")
            return False

    def get_content_history(self, content_type: str, max_count: int = 10) -> List[dict]:
        """Get version history for content type.

        Args:
            content_type: Type of content
            max_count: Maximum number of versions to return

        Returns:
            List of version information
        """
        try:
            return self.backup_manager.version_manager.get_content_history(
                content_type, max_count
            )
        except Exception as e:
            logger.error(
                f"Failed to get content history: {e}",
                extra={"content_type": content_type},
            )
            return []

    def get_content_version(
        self, content_type: str, commit_hash: str
    ) -> Optional[dict]:
        """Get specific version of content.

        Args:
            content_type: Type of content
            commit_hash: Git commit hash

        Returns:
            Content data if found, None otherwise
        """
        try:
            return self.backup_manager.version_manager.get_content_version(
                content_type, commit_hash
            )
        except Exception as e:
            logger.error(
                f"Failed to get content version: {e}",
                extra={"content_type": content_type, "commit_hash": commit_hash},
            )
            return None

    def restore_content_version(self, content_type: str, commit_hash: str) -> bool:
        """Restore content to a specific version.

        Args:
            content_type: Type of content
            commit_hash: Git commit hash to restore

        Returns:
            True if restore was successful
        """
        try:
            return self.backup_manager.version_manager.restore_content_version(
                content_type, commit_hash
            )
        except Exception as e:
            logger.error(
                f"Failed to restore content version: {e}",
                extra={"content_type": content_type, "commit_hash": commit_hash},
            )
            return False

    def get_repository_status(self) -> dict:
        """Get comprehensive repository status.

        Returns:
            Repository status information
        """
        try:
            return {
                "content_directory": str(self.content_directory),
                "backup_status": self.backup_manager.get_backup_status(),
                "git_status": self.backup_manager.version_manager.get_repository_status(),
                "content_types": content_type_registry.get_registry_status(),
                "available_types": content_type_registry.list_content_types(),
            }
        except Exception as e:
            logger.error(f"Failed to get repository status: {e}")
            return {"error": str(e)}
