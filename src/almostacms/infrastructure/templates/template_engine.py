"""Jinja2-based template engine implementation."""

import shutil
from pathlib import Path
from typing import Dict, List, Optional

from jinja2 import Environment, FileSystemLoader, TemplateNotFound

from ...domain.models.base import BaseContent
from ..logging import get_logger, log_operation
from .theme_manager import FileSystemThemeManager

logger = get_logger(__name__)


class Jinja2TemplateEngine:
    """Jinja2-based template engine with theme support."""

    def __init__(
        self, theme_manager: FileSystemThemeManager, default_theme: str = "default"
    ):
        """Initialize template engine.

        Args:
            theme_manager: Theme manager instance
            default_theme: Default theme name to use
        """
        self.theme_manager = theme_manager
        self.default_theme = default_theme
        self._jinja_environments: Dict[str, Environment] = {}

        logger.info(f"Template engine initialized with default theme: {default_theme}")

    def _get_jinja_environment(self, theme: str) -> Optional[Environment]:
        """Get or create Jinja2 environment for theme.

        Args:
            theme: Theme name

        Returns:
            Jinja2 Environment instance or None if theme invalid
        """
        if theme in self._jinja_environments:
            return self._jinja_environments[theme]

        # Validate theme
        if not self.theme_manager.validate_theme(theme):
            logger.error(f"Invalid theme: {theme}")
            return None

        # Get theme path
        theme_path = self.theme_manager.get_theme_path(theme)
        if not theme_path:
            return None

        # Create Jinja2 environment
        templates_dir = theme_path / "templates"
        if not templates_dir.exists():
            logger.error(f"Templates directory not found for theme {theme}")
            return None

        try:
            loader = FileSystemLoader(str(templates_dir))
            env = Environment(
                loader=loader,
                autoescape=True,
                trim_blocks=True,
                lstrip_blocks=True,
            )

            # Add custom filters and functions
            self._add_template_functions(env)

            self._jinja_environments[theme] = env
            logger.debug(f"Created Jinja2 environment for theme: {theme}")
            return env

        except Exception as e:
            logger.error(f"Failed to create Jinja2 environment for theme {theme}: {e}")
            return None

    def _add_template_functions(self, env: Environment) -> None:
        """Add custom template functions and filters.

        Args:
            env: Jinja2 environment to modify
        """
        # Custom filter to format dates
        def format_date(date_str: str, format: str = "%B %d, %Y") -> str:
            """Format date string."""
            try:
                from datetime import datetime

                if isinstance(date_str, str):
                    # Try to parse ISO format
                    dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                    return dt.strftime(format)
                return str(date_str)
            except Exception:
                return str(date_str)

        # Custom filter to truncate text
        def truncate_words(text: str, count: int = 50) -> str:
            """Truncate text to specified word count."""
            if not text:
                return ""
            words = text.split()
            if len(words) <= count:
                return text
            return " ".join(words[:count]) + "..."

        # Custom filter for URL-safe strings
        def slugify(text: str) -> str:
            """Convert text to URL-safe slug."""
            import re

            text = text.lower().strip()
            text = re.sub(r"[^\w\s-]", "", text)
            text = re.sub(r"[-\s]+", "-", text)
            return text

        # Register filters
        env.filters["format_date"] = format_date
        env.filters["truncate_words"] = truncate_words
        env.filters["slugify"] = slugify

        # Add global functions
        env.globals[
            "current_year"
        ] = lambda: "2025"  # In real app, use datetime.now().year

    @log_operation("render_template")
    def render_template(
        self, template_name: str, context: Dict[str, any], theme: Optional[str] = None
    ) -> str:
        """Render a template with given context.

        Args:
            template_name: Name of template to render
            context: Template context variables
            theme: Theme to use (defaults to default theme)

        Returns:
            Rendered template as string
        """
        try:
            theme = theme or self.default_theme
            env = self._get_jinja_environment(theme)

            if not env:
                raise ValueError(f"Cannot create environment for theme: {theme}")

            # Load theme config for additional context
            theme_config = self.theme_manager.load_theme_config(theme)
            if theme_config:
                context["theme_config"] = theme_config

            # Add theme assets to context
            theme_path = self.theme_manager.get_theme_path(theme)
            if theme_path:
                assets_config = theme_config.get("assets", {}) if theme_config else {}
                context["theme_assets"] = {
                    "css": [f"assets/{css}" for css in assets_config.get("css", [])],
                    "js": [f"assets/{js}" for js in assets_config.get("js", [])],
                }

            template = env.get_template(template_name)
            rendered = template.render(**context)

            logger.debug(f"Rendered template {template_name} with theme {theme}")
            return rendered

        except TemplateNotFound:
            logger.error(f"Template not found: {template_name} in theme {theme}")
            raise
        except Exception as e:
            logger.error(f"Failed to render template {template_name}: {e}")
            raise

    @log_operation("render_content")
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
            theme: Theme to use

        Returns:
            Rendered content as string
        """
        try:
            theme = theme or self.default_theme
            content_type = content.content_type

            # Determine template name
            if not template_name:
                # Use content type to find template
                theme_config = self.theme_manager.load_theme_config(theme)
                if theme_config:
                    section_templates = theme_config.get("templates", {}).get(
                        "sections", {}
                    )
                    template_name = section_templates.get(
                        content_type, f"sections/{content_type}.html"
                    )
                else:
                    template_name = f"sections/{content_type}.html"

            # Build context
            context = {
                content_type: content.dict(),
                "content": content.dict(),
                "content_type": content_type,
            }

            return self.render_template(template_name, context, theme)

        except Exception as e:
            logger.error(f"Failed to render content {content_type}: {e}")
            raise

    @log_operation("render_site")
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
        try:
            theme = theme or self.default_theme

            if not output_dir:
                output_dir = Path("output")

            output_dir.mkdir(parents=True, exist_ok=True)

            # Build global context
            global_context = {
                "site_title": "My Portfolio",  # Will be overridden by navigation content
                "site_description": "Personal Portfolio Website",
            }

            # Add all content to context
            for content_type, content in content_data.items():
                if content:
                    global_context[content_type] = content.dict()

                    # Extract site-level information
                    if content_type == "navigation":
                        global_context["site_title"] = content.site_title
                    elif content_type == "personal_info":
                        global_context[
                            "site_description"
                        ] = f"{content.name} - {content.title}"

            # Render individual sections
            section_html = {}
            for content_type, content in content_data.items():
                if content:
                    try:
                        section_html[f"{content_type}_html"] = self.render_content(
                            content, theme=theme
                        )
                    except Exception as e:
                        logger.warning(f"Failed to render section {content_type}: {e}")
                        section_html[
                            f"{content_type}_html"
                        ] = f"<!-- Error rendering {content_type} -->"

            # Add section HTML to global context
            global_context.update(section_html)

            # Render main page
            try:
                theme_config = self.theme_manager.load_theme_config(theme)
                layout_template = "layout.html"
                if theme_config:
                    layout_template = theme_config.get("templates", {}).get(
                        "layout", "layout.html"
                    )

                # Combine all section HTML for content
                content_sections = []
                section_order = [
                    "personal_info",
                    "about",
                    "resume",
                    "portfolio",
                    "blog",
                    "contact",
                ]

                for section_type in section_order:
                    if f"{section_type}_html" in global_context:
                        content_sections.append(global_context[f"{section_type}_html"])

                global_context["content"] = "\n".join(content_sections)

                # Render the main page
                main_html = self.render_template(layout_template, global_context, theme)

                # Write main HTML file
                index_file = output_dir / "index.html"
                index_file.write_text(main_html, encoding="utf-8")

                logger.info(f"Main page rendered: {index_file}")

            except Exception as e:
                logger.error(f"Failed to render main page: {e}")
                raise

            # Copy theme assets
            self._copy_theme_assets(theme, output_dir)

            logger.info(f"Site rendered successfully to: {output_dir}")
            return output_dir

        except Exception as e:
            logger.error(f"Failed to render site: {e}")
            raise

    def _copy_theme_assets(self, theme: str, output_dir: Path) -> None:
        """Copy theme assets to output directory.

        Args:
            theme: Theme name
            output_dir: Output directory
        """
        try:
            theme_path = self.theme_manager.get_theme_path(theme)
            if not theme_path:
                return

            assets_dir = theme_path / "assets"
            if not assets_dir.exists():
                return

            output_assets_dir = output_dir / "assets"
            if output_assets_dir.exists():
                shutil.rmtree(output_assets_dir)

            shutil.copytree(assets_dir, output_assets_dir)
            logger.debug(
                f"Copied theme assets from {assets_dir} to {output_assets_dir}"
            )

        except Exception as e:
            logger.warning(f"Failed to copy theme assets: {e}")

    def list_themes(self) -> List[str]:
        """Get list of available themes."""
        return self.theme_manager.list_themes()

    def get_theme_info(self, theme_name: str) -> Optional[Dict[str, any]]:
        """Get information about a theme."""
        return self.theme_manager.get_theme_info(theme_name)

    def validate_theme(self, theme_name: str) -> bool:
        """Validate that a theme exists and is usable."""
        return self.theme_manager.validate_theme(theme_name)
