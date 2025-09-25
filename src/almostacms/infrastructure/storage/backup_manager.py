"""Backup manager with automatic rollback capabilities."""

import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Union

from ..logging import get_logger, log_operation
from ..versioning import VersionManager

logger = get_logger(__name__)


class BackupManager:
    """Manages automatic backups and rollback operations."""

    def __init__(
        self,
        content_directory: Path,
        backup_directory: Path,
        max_backups: int = 50,
        auto_backup: bool = True,
    ):
        """Initialize backup manager.

        Args:
            content_directory: Directory containing content files
            backup_directory: Directory for backup storage
            max_backups: Maximum number of backups to keep
            auto_backup: Whether to create automatic backups
        """
        self.content_directory = Path(content_directory)
        self.backup_directory = Path(backup_directory)
        self.max_backups = max_backups
        self.auto_backup = auto_backup

        # Initialize version manager
        self.version_manager = VersionManager(content_directory, backup_directory)

        # Track current operation for rollback
        self._current_operation: Optional[str] = None
        self._operation_backup: Optional[str] = None

        logger.info(
            "Backup manager initialized",
            extra={
                "content_directory": str(self.content_directory),
                "backup_directory": str(self.backup_directory),
                "max_backups": self.max_backups,
                "auto_backup": self.auto_backup,
            },
        )

    @log_operation("start_operation")
    def start_operation(self, operation_name: str) -> Optional[str]:
        """Start a new operation with automatic backup.

        Args:
            operation_name: Name of the operation

        Returns:
            Backup name if created, None otherwise
        """
        try:
            self._current_operation = operation_name
            self._operation_backup = None

            if self.auto_backup:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                backup_name = f"auto_{operation_name}_{timestamp}"

                backup_result = self.version_manager.create_backup(backup_name)
                if backup_result:
                    self._operation_backup = backup_result
                    logger.info(
                        f"Automatic backup created for operation: {operation_name}",
                        extra={
                            "operation": operation_name,
                            "backup_name": backup_result,
                        },
                    )
                    return backup_result
                else:
                    logger.warning(
                        f"Failed to create automatic backup for operation: {operation_name}"
                    )

            return None

        except Exception as e:
            logger.error(
                f"Failed to start operation {operation_name}: {e}",
                extra={"operation": operation_name},
            )
            return None

    @log_operation("complete_operation")
    def complete_operation(self, success: bool = True) -> bool:
        """Complete current operation.

        Args:
            success: Whether the operation was successful

        Returns:
            True if completion was successful
        """
        try:
            if self._current_operation is None:
                logger.warning("No active operation to complete")
                return True

            operation_name = self._current_operation
            backup_name = self._operation_backup

            if success:
                logger.info(
                    f"Operation completed successfully: {operation_name}",
                    extra={
                        "operation": operation_name,
                        "backup_name": backup_name,
                    },
                )
            else:
                logger.warning(
                    f"Operation failed: {operation_name}",
                    extra={
                        "operation": operation_name,
                        "backup_name": backup_name,
                    },
                )

            # Clean up operation state
            self._current_operation = None
            self._operation_backup = None

            # Clean up old backups
            if success:
                self._cleanup_old_backups()

            return True

        except Exception as e:
            logger.error(f"Failed to complete operation: {e}")
            return False

    @log_operation("rollback_operation")
    def rollback_operation(self, reason: str = "Operation failed") -> bool:
        """Rollback current operation to previous state.

        Args:
            reason: Reason for rollback

        Returns:
            True if rollback was successful
        """
        try:
            if self._current_operation is None:
                logger.warning("No active operation to rollback")
                return False

            if self._operation_backup is None:
                logger.error("No backup available for rollback")
                return False

            operation_name = self._current_operation
            backup_name = self._operation_backup

            logger.info(
                f"Rolling back operation: {operation_name}",
                extra={
                    "operation": operation_name,
                    "backup_name": backup_name,
                    "reason": reason,
                },
            )

            # Restore from backup
            success = self.version_manager.restore_backup(backup_name)

            if success:
                logger.info(
                    f"Rollback completed successfully for operation: {operation_name}",
                    extra={
                        "operation": operation_name,
                        "backup_name": backup_name,
                    },
                )

                # Mark operation as completed (failed)
                self.complete_operation(success=False)
                return True
            else:
                logger.error(
                    f"Rollback failed for operation: {operation_name}",
                    extra={
                        "operation": operation_name,
                        "backup_name": backup_name,
                    },
                )
                return False

        except Exception as e:
            logger.error(f"Exception during rollback: {e}")
            return False

    def save_with_backup(
        self,
        content_type: str,
        content_id: str,
        content_data: dict,
        operation_name: Optional[str] = None,
    ) -> Optional[str]:
        """Save content with automatic backup and versioning.

        Args:
            content_type: Type of content
            content_id: Content identifier
            content_data: Content data
            operation_name: Optional operation name

        Returns:
            Git commit hash if successful, None otherwise
        """
        try:
            if operation_name is None:
                operation_name = f"save_{content_type}"

            # Start operation with backup
            backup_name = self.start_operation(operation_name)

            try:
                # Save content with version manager
                commit_hash = self.version_manager.save_content_version(
                    content_type=content_type,
                    content_id=content_id,
                    content_data=content_data,
                )

                if commit_hash:
                    self.complete_operation(success=True)
                    logger.info(
                        "Content saved with backup",
                        extra={
                            "content_type": content_type,
                            "content_id": content_id,
                            "commit_hash": commit_hash,
                            "backup_name": backup_name,
                        },
                    )
                    return commit_hash
                else:
                    logger.error("Failed to save content, rolling back")
                    self.rollback_operation("Save operation failed")
                    return None

            except Exception as e:
                logger.error(f"Error during content save: {e}")
                self.rollback_operation(f"Save error: {str(e)}")
                return None

        except Exception as e:
            logger.error(f"Failed to save content with backup: {e}")
            return None

    def _cleanup_old_backups(self) -> None:
        """Remove old backups to stay within limits."""
        try:
            backups = self.version_manager.list_backups()

            if len(backups) <= self.max_backups:
                return

            # Sort by creation time and remove oldest
            backups.sort(key=lambda x: x.get("created_at", ""))
            backups_to_remove = backups[: -self.max_backups]

            for backup in backups_to_remove:
                backup_path = Path(backup["path"])
                if backup_path.exists():
                    shutil.rmtree(backup_path)
                    logger.debug(
                        "Removed old backup", extra={"backup_name": backup["name"]}
                    )

            logger.info(
                f"Cleaned up {len(backups_to_remove)} old backups",
                extra={"removed_count": len(backups_to_remove)},
            )

        except Exception as e:
            logger.error(f"Failed to cleanup old backups: {e}")

    def get_backup_status(self) -> dict:
        """Get current backup status.

        Returns:
            Backup status information
        """
        try:
            backups = self.version_manager.list_backups()

            return {
                "auto_backup_enabled": self.auto_backup,
                "max_backups": self.max_backups,
                "total_backups": len(backups),
                "current_operation": self._current_operation,
                "operation_backup": self._operation_backup,
                "recent_backups": backups[:5],  # Show 5 most recent
                "backup_directory": str(self.backup_directory),
                "content_directory": str(self.content_directory),
            }

        except Exception as e:
            logger.error(f"Failed to get backup status: {e}")
            return {"error": str(e)}

    def create_manual_backup(self, backup_name: Optional[str] = None) -> Optional[str]:
        """Create a manual backup.

        Args:
            backup_name: Optional custom backup name

        Returns:
            Backup name if successful, None otherwise
        """
        if backup_name is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"manual_{timestamp}"

        return self.version_manager.create_backup(backup_name)

    def restore_from_backup(self, backup_name: str) -> bool:
        """Restore content from a specific backup.

        Args:
            backup_name: Name of backup to restore

        Returns:
            True if restore was successful
        """
        operation_name = f"restore_{backup_name}"

        # Start operation (this creates a backup of current state)
        self.start_operation(operation_name)

        try:
            success = self.version_manager.restore_backup(backup_name)
            self.complete_operation(success=success)
            return success

        except Exception as e:
            logger.error(f"Error during restore: {e}")
            self.rollback_operation(f"Restore error: {str(e)}")
            return False
