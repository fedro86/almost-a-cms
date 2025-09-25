"""Almost-a-CMS: A user-friendly static site CMS for personal portfolios."""

__version__ = "2.0.0-dev"
__author__ = "Almost-a-CMS Team"
__email__ = "team@almostacms.dev"
__license__ = "MIT"

from .application.api import *  # noqa: F401,F403

# Re-export main components for easy importing
from .domain.models import *  # noqa: F401,F403
