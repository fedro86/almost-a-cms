"""Version management service for content."""

import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from ..logging import get_logger, log_operation
from .git_repository import GitRepository

logger = get_logger(__name__)


class VersionManager:
    """Manages content versioning with Git backend."""

    def __init__(self, content_directory: Path, backup_directory: Path):
        """Initialize version manager.

        Args:
            content_directory: Directory containing content files
            backup_directory: Directory for backup storage
        """
        self.content_directory = Path(content_directory)
        self.backup_directory = Path(backup_directory)

        # Initialize git repository in content directory
        self.git_repo = GitRepository(self.content_directory)

        # Ensure backup directory exists
        self.backup_directory.mkdir(parents=True, exist_ok=True)

        logger.info(
            "Version manager initialized",
            extra={
                "content_directory": str(self.content_directory),
                "backup_directory": str(self.backup_directory),
            },
        )

    @log_operation("create_backup")
    def create_backup(self, backup_name: Optional[str] = None) -> Optional[str]:
        """Create a full backup of content.

        Args:
            backup_name: Optional name for backup (auto-generated if None)

        Returns:
            Backup name/path if successful, None otherwise
        """
        try:
            if backup_name is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                backup_name = f"backup_{timestamp}"

            backup_path = self.backup_directory / backup_name

            # Create backup directory
            backup_path.mkdir(parents=True, exist_ok=True)

            # Copy all content files
            for file_path in self.content_directory.rglob("*.json"):
                relative_path = file_path.relative_to(self.content_directory)
                backup_file_path = backup_path / relative_path
                backup_file_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(file_path, backup_file_path)

            # Create backup metadata
            metadata = {
                "created_at": datetime.now().isoformat(),
                "content_directory": str(self.content_directory),
                "file_count": len(list(self.content_directory.rglob("*.json"))),
                "git_status": self.git_repo.get_repository_status(),
            }

            metadata_file = backup_path / "backup_metadata.json"
            metadata_file.write_text(json.dumps(metadata, indent=2))

            # Create git backup branch
            git_branch_name = f"backup_{backup_name}"
            self.git_repo.create_backup_branch(git_branch_name)

            logger.info(
                "Backup created successfully",
                extra={
                    "backup_name": backup_name,
                    "backup_path": str(backup_path),
                    "file_count": metadata["file_count"],
                },
            )
            return backup_name

        except Exception as e:
            logger.error(
                f"Failed to create backup: {e}", extra={"backup_name": backup_name}
            )
            return None

    @log_operation("restore_backup")
    def restore_backup(self, backup_name: str) -> bool:
        """Restore content from backup.

        Args:
            backup_name: Name of backup to restore

        Returns:
            True if restore was successful
        """
        try:
            backup_path = self.backup_directory / backup_name

            if not backup_path.exists():
                logger.error("Backup not found", extra={"backup_name": backup_name})
                return False

            # Create current backup before restore
            current_backup = self.create_backup(
                f"pre_restore_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            )
            if current_backup is None:
                logger.error("Failed to create pre-restore backup")
                return False

            # Clear current content (keep git directory)
            for file_path in self.content_directory.rglob("*.json"):
                file_path.unlink()

            # Restore files from backup
            restored_count = 0
            for backup_file in backup_path.rglob("*.json"):
                if backup_file.name == "backup_metadata.json":
                    continue

                relative_path = backup_file.relative_to(backup_path)
                target_path = self.content_directory / relative_path
                target_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(backup_file, target_path)
                restored_count += 1

            # Commit restoration to git
            self.git_repo.add_file(".")
            commit_message = f"Restore content from backup: {backup_name}"
            commit_hash = self.git_repo.commit(commit_message)

            logger.info(
                "Backup restored successfully",
                extra={
                    "backup_name": backup_name,
                    "files_restored": restored_count,
                    "commit_hash": commit_hash,
                },
            )
            return True

        except Exception as e:
            logger.error(
                f"Failed to restore backup: {e}", extra={"backup_name": backup_name}
            )
            return False

    @log_operation("save_content_version")
    def save_content_version(
        self,
        content_type: str,
        content_id: str,
        content_data: dict,
        commit_message: Optional[str] = None,
    ) -> Optional[str]:
        """Save content with automatic versioning.

        Args:
            content_type: Type of content
            content_id: Content identifier
            content_data: Content data to save
            commit_message: Optional custom commit message

        Returns:
            Git commit hash if successful, None otherwise
        """
        try:
            # Determine file path
            file_path = self.content_directory / f"{content_type}.json"
            relative_file_path = file_path.relative_to(self.content_directory)

            # Create backup before changing
            backup_name = self.create_backup(
                f"auto_{content_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            )
            if backup_name is None:
                logger.warning("Could not create automatic backup")

            # Save content to file
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_text(json.dumps(content_data, indent=2, ensure_ascii=False))

            # Add to git
            self.git_repo.add_file(str(relative_file_path))

            # Create commit message
            if commit_message is None:
                commit_message = f"Update {content_type} content"
                if content_id != content_type:
                    commit_message += f" ({content_id})"

            # Commit changes
            commit_hash = self.git_repo.commit(commit_message)

            logger.info(
                "Content version saved",
                extra={
                    "content_type": content_type,
                    "content_id": content_id,
                    "file_path": str(relative_file_path),
                    "commit_hash": commit_hash,
                    "backup_name": backup_name,
                },
            )
            return commit_hash

        except Exception as e:
            logger.error(
                f"Failed to save content version: {e}",
                extra={"content_type": content_type, "content_id": content_id},
            )
            return None

    def get_content_history(self, content_type: str, max_count: int = 10) -> List[dict]:
        """Get version history for content type.

        Args:
            content_type: Type of content
            max_count: Maximum number of versions to return

        Returns:
            List of version information
        """
        file_path = f"{content_type}.json"
        return self.git_repo.get_file_history(file_path, max_count)

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
            file_path = f"{content_type}.json"
            content_json = self.git_repo.get_file_content(file_path, commit_hash)

            if content_json is None:
                return None

            return json.loads(content_json)

        except (json.JSONDecodeError, Exception) as e:
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
            # Create backup before restore
            backup_name = self.create_backup(
                f"pre_restore_{content_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            )

            # Restore file from git
            file_path = f"{content_type}.json"
            success = self.git_repo.restore_file(file_path, commit_hash)

            if success:
                logger.info(
                    "Content version restored",
                    extra={
                        "content_type": content_type,
                        "commit_hash": commit_hash,
                        "backup_name": backup_name,
                    },
                )

            return success

        except Exception as e:
            logger.error(
                f"Failed to restore content version: {e}",
                extra={"content_type": content_type, "commit_hash": commit_hash},
            )
            return False

    def list_backups(self) -> List[dict]:
        """List available backups.

        Returns:
            List of backup information
        """
        try:
            backups = []

            for backup_dir in self.backup_directory.iterdir():
                if not backup_dir.is_dir():
                    continue

                metadata_file = backup_dir / "backup_metadata.json"
                if metadata_file.exists():
                    try:
                        metadata = json.loads(metadata_file.read_text())
                        metadata["name"] = backup_dir.name
                        metadata["path"] = str(backup_dir)
                        backups.append(metadata)
                    except json.JSONDecodeError:
                        logger.warning(f"Invalid backup metadata: {metadata_file}")

            # Sort by creation time (newest first)
            backups.sort(key=lambda x: x.get("created_at", ""), reverse=True)

            logger.debug(f"Found {len(backups)} backups")
            return backups

        except Exception as e:
            logger.error(f"Failed to list backups: {e}")
            return []

    def get_repository_status(self) -> dict:
        """Get current repository status.

        Returns:
            Repository status information
        """
        return self.git_repo.get_repository_status()
