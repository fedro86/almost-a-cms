"""Abstract interface for template engine operations."""

from pathlib import Path
from typing import Dict, List, Optional, Protocol

from ..models.base import BaseContent


class TemplateEngine(Protocol):
    """Abstract template engine interface."""

    def render_template(
        self, template_name: str, context: Dict[str, any], theme: Optional[str] = None
    ) -> str:
        """Render a template with given context.

        Args:
            template_name: Name of template to render
            context: Template context variables
            theme: Optional theme name (uses default if None)

        Returns:
            Rendered template as string
        """
        ...

    def render_content(
        self,
        content: BaseContent,
        template_name: Optional[str] = None,
        theme: Optional[str] = None,
    ) -> str:
        """Render content using appropriate template.

        Args:
            content: Content object to render
            template_name: Optional template override
            theme: Optional theme name

        Returns:
            Rendered content as string
        """
        ...

    def render_site(
        self,
        content_data: Dict[str, BaseContent],
        theme: Optional[str] = None,
        output_dir: Optional[Path] = None,
    ) -> Path:
        """Render complete site with all content.

        Args:
            content_data: Dictionary of all content by type
            theme: Theme to use for rendering
            output_dir: Directory to output rendered site

        Returns:
            Path to generated site directory
        """
        ...

    def list_themes(self) -> List[str]:
        """Get list of available themes.

        Returns:
            List of theme names
        """
        ...

    def get_theme_info(self, theme_name: str) -> Optional[Dict[str, any]]:
        """Get information about a theme.

        Args:
            theme_name: Name of theme

        Returns:
            Theme information dictionary or None if not found
        """
        ...

    def validate_theme(self, theme_name: str) -> bool:
        """Validate that a theme exists and is usable.

        Args:
            theme_name: Name of theme to validate

        Returns:
            True if theme is valid
        """
        ...


class ThemeManager(Protocol):
    """Abstract theme management interface."""

    def get_theme_path(self, theme_name: str) -> Optional[Path]:
        """Get path to theme directory.

        Args:
            theme_name: Name of theme

        Returns:
            Path to theme directory or None if not found
        """
        ...

    def load_theme_config(self, theme_name: str) -> Optional[Dict[str, any]]:
        """Load theme configuration.

        Args:
            theme_name: Name of theme

        Returns:
            Theme configuration dictionary
        """
        ...

    def get_template_path(self, theme_name: str, template_name: str) -> Optional[Path]:
        """Get path to specific template file.

        Args:
            theme_name: Name of theme
            template_name: Name of template

        Returns:
            Path to template file or None if not found
        """
        ...
