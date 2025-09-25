"""Git repository operations for content versioning."""

import shutil
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from git import InvalidGitRepositoryError, Repo
from git.exc import GitCommandError

from ..logging import get_logger

logger = get_logger(__name__)


class GitRepository:
    """Git repository wrapper for content versioning."""

    def __init__(self, repo_path: Path, auto_init: bool = True):
        """Initialize Git repository.

        Args:
            repo_path: Path to the repository
            auto_init: Whether to initialize repo if it doesn't exist
        """
        self.repo_path = Path(repo_path).resolve()
        self._repo: Optional[Repo] = None

        if auto_init:
            self._ensure_repository()

    def _ensure_repository(self) -> None:
        """Ensure git repository exists and is initialized."""
        try:
            self._repo = Repo(self.repo_path)
            logger.debug(
                "Git repository found", extra={"repo_path": str(self.repo_path)}
            )
        except InvalidGitRepositoryError:
            # Initialize new repository
            logger.info(
                "Initializing new git repository",
                extra={"repo_path": str(self.repo_path)},
            )
            self.repo_path.mkdir(parents=True, exist_ok=True)
            self._repo = Repo.init(self.repo_path)

            # Create initial .gitignore
            gitignore_content = """# Almost-a-CMS - Auto-generated
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/
.env
.env.local
.env.production
node_modules/
.DS_Store
Thumbs.db
*.log
logs/
.coverage
htmlcov/
.pytest_cache/
.mypy_cache/
dist/
build/
*.egg-info/
"""
            gitignore_path = self.repo_path / ".gitignore"
            if not gitignore_path.exists():
                gitignore_path.write_text(gitignore_content)
                self.add_file(".gitignore")
                self.commit("Initial commit: Add .gitignore")

    @property
    def repo(self) -> Repo:
        """Get the git repository instance."""
        if self._repo is None:
            raise RuntimeError("Git repository not initialized")
        return self._repo

    def is_repository(self) -> bool:
        """Check if path contains a valid git repository."""
        try:
            return self._repo is not None and not self._repo.bare
        except Exception:
            return False

    def add_file(self, file_path: str) -> bool:
        """Add file to git staging area.

        Args:
            file_path: Relative path to file

        Returns:
            True if file was added successfully
        """
        try:
            self.repo.index.add([file_path])
            logger.debug("File added to git", extra={"file_path": file_path})
            return True
        except GitCommandError as e:
            logger.error(
                f"Failed to add file to git: {e}", extra={"file_path": file_path}
            )
            return False

    def commit(
        self,
        message: str,
        author_name: str = "Almost-a-CMS",
        author_email: str = "noreply@almostacms.dev",
    ) -> Optional[str]:
        """Create a git commit.

        Args:
            message: Commit message
            author_name: Author name
            author_email: Author email

        Returns:
            Commit hash if successful, None otherwise
        """
        try:
            # Check if there are changes to commit
            if not self.repo.index.diff("HEAD"):
                logger.debug("No changes to commit")
                return None

            # Create commit
            commit = self.repo.index.commit(
                message,
                author_name=author_name,
                author_email=author_email,
                committer_name=author_name,
                committer_email=author_email,
            )

            logger.info(
                "Git commit created",
                extra={
                    "commit_hash": commit.hexsha,
                    "message": message,
                    "author": author_name,
                },
            )
            return commit.hexsha

        except GitCommandError as e:
            logger.error(
                f"Failed to create git commit: {e}", extra={"message": message}
            )
            return None

    def get_file_history(self, file_path: str, max_count: int = 10) -> List[dict]:
        """Get commit history for a specific file.

        Args:
            file_path: Path to file relative to repo root
            max_count: Maximum number of commits to return

        Returns:
            List of commit information dictionaries
        """
        try:
            commits = list(self.repo.iter_commits(paths=file_path, max_count=max_count))
            history = []

            for commit in commits:
                history.append(
                    {
                        "hash": commit.hexsha,
                        "short_hash": commit.hexsha[:8],
                        "message": commit.message.strip(),
                        "author": commit.author.name,
                        "author_email": commit.author.email,
                        "date": commit.committed_datetime.isoformat(),
                        "timestamp": commit.committed_date,
                    }
                )

            logger.debug(
                "Retrieved file history",
                extra={"file_path": file_path, "commit_count": len(history)},
            )
            return history

        except GitCommandError as e:
            logger.error(
                f"Failed to get file history: {e}", extra={"file_path": file_path}
            )
            return []

    def get_file_content(
        self, file_path: str, commit_hash: Optional[str] = None
    ) -> Optional[str]:
        """Get file content from a specific commit.

        Args:
            file_path: Path to file relative to repo root
            commit_hash: Commit hash (None for current version)

        Returns:
            File content as string, None if not found
        """
        try:
            if commit_hash:
                commit = self.repo.commit(commit_hash)
                blob = commit.tree[file_path]
            else:
                blob = self.repo.head.commit.tree[file_path]

            content = blob.data_stream.read().decode("utf-8")
            logger.debug(
                "Retrieved file content",
                extra={"file_path": file_path, "commit_hash": commit_hash},
            )
            return content

        except (GitCommandError, KeyError) as e:
            logger.error(
                f"Failed to get file content: {e}",
                extra={"file_path": file_path, "commit_hash": commit_hash},
            )
            return None

    def restore_file(self, file_path: str, commit_hash: str) -> bool:
        """Restore file to a previous version.

        Args:
            file_path: Path to file relative to repo root
            commit_hash: Commit hash to restore from

        Returns:
            True if file was restored successfully
        """
        try:
            # Get file content from the specified commit
            content = self.get_file_content(file_path, commit_hash)
            if content is None:
                return False

            # Write content to file
            full_path = self.repo_path / file_path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_text(content, encoding="utf-8")

            # Add and commit the restoration
            self.add_file(file_path)
            commit_message = f"Restore {file_path} to version {commit_hash[:8]}"
            self.commit(commit_message)

            logger.info(
                "File restored from git history",
                extra={
                    "file_path": file_path,
                    "commit_hash": commit_hash,
                    "restore_message": commit_message,
                },
            )
            return True

        except Exception as e:
            logger.error(
                f"Failed to restore file: {e}",
                extra={"file_path": file_path, "commit_hash": commit_hash},
            )
            return False

    def create_backup_branch(self, branch_name: Optional[str] = None) -> bool:
        """Create a backup branch from current state.

        Args:
            branch_name: Name for backup branch (auto-generated if None)

        Returns:
            True if branch was created successfully
        """
        try:
            if branch_name is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                branch_name = f"backup_{timestamp}"

            # Create new branch
            new_branch = self.repo.create_head(branch_name)
            logger.info(
                "Backup branch created",
                extra={
                    "branch_name": branch_name,
                    "commit_hash": new_branch.commit.hexsha,
                },
            )
            return True

        except GitCommandError as e:
            logger.error(
                f"Failed to create backup branch: {e}",
                extra={"branch_name": branch_name},
            )
            return False

    def get_repository_status(self) -> dict:
        """Get current repository status.

        Returns:
            Dictionary with repository status information
        """
        try:
            status = {
                "is_dirty": self.repo.is_dirty(),
                "untracked_files": self.repo.untracked_files,
                "modified_files": [item.a_path for item in self.repo.index.diff(None)],
                "staged_files": [item.a_path for item in self.repo.index.diff("HEAD")],
                "current_branch": self.repo.active_branch.name,
                "total_commits": len(list(self.repo.iter_commits())),
                "last_commit": {
                    "hash": self.repo.head.commit.hexsha,
                    "message": self.repo.head.commit.message.strip(),
                    "author": self.repo.head.commit.author.name,
                    "date": self.repo.head.commit.committed_datetime.isoformat(),
                }
                if self.repo.head.is_valid()
                else None,
            }
            return status

        except Exception as e:
            logger.error(f"Failed to get repository status: {e}")
            return {"error": str(e)}
