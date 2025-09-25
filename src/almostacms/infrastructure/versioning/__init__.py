"""Git-based versioning system."""

from .git_repository import GitRepository
from .version_manager import VersionManager

__all__ = ["GitRepository", "VersionManager"]
