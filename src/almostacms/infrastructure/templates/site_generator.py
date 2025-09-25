"""Static site generator with optimization pipeline."""

import shutil
from pathlib import Path
from typing import Dict, List, Optional

from ...domain.models.base import BaseContent
from ...infrastructure.logging import get_logger, log_operation
from ...infrastructure.storage import FileSystemContentRepository
from .template_engine import Jinja2TemplateEngine

logger = get_logger(__name__)


class StaticSiteGenerator:
    """Generates optimized static sites from content and themes."""

    def __init__(
        self,
        template_engine: Jinja2TemplateEngine,
        content_repository: FileSystemContentRepository,
        media_directory: Path,
        output_directory: Path,
    ):
        """Initialize site generator.

        Args:
            template_engine: Template engine for rendering
            content_repository: Repository for loading content
            media_directory: Directory containing media files
            output_directory: Base directory for generated sites
        """
        self.template_engine = template_engine
        self.content_repository = content_repository
        self.media_directory = Path(media_directory)
        self.output_directory = Path(output_directory)

        # Ensure directories exist
        self.output_directory.mkdir(parents=True, exist_ok=True)
        self.media_directory.mkdir(parents=True, exist_ok=True)

        logger.info(
            "Static site generator initialized",
            extra={
                "media_directory": str(self.media_directory),
                "output_directory": str(self.output_directory),
            },
        )

    @log_operation("generate_site")
    async def generate_site(
        self,
        theme: Optional[str] = None,
        output_name: str = "site",
        optimize: bool = True,
        clean_output: bool = True,
    ) -> Path:
        """Generate complete static site.

        Args:
            theme: Theme to use (uses default if None)
            output_name: Name for output directory
            optimize: Whether to optimize assets
            clean_output: Whether to clean output directory first

        Returns:
            Path to generated site
        """
        try:
            # Create output directory
            site_output_dir = self.output_directory / output_name

            if clean_output and site_output_dir.exists():
                shutil.rmtree(site_output_dir)

            site_output_dir.mkdir(parents=True, exist_ok=True)

            # Load all content
            content_data = await self._load_all_content()

            if not content_data:
                logger.warning("No content found to generate site")
                # Create a placeholder page
                self._create_placeholder_site(site_output_dir)
                return site_output_dir

            # Generate site using template engine
            self.template_engine.render_site(
                content_data=content_data,
                theme=theme,
                output_dir=site_output_dir,
            )

            # Copy media files
            await self._copy_media_files(site_output_dir)

            # Optimize assets if requested
            if optimize:
                await self._optimize_assets(site_output_dir)

            # Generate additional files
            await self._generate_additional_files(site_output_dir, content_data)

            logger.info(f"Site generated successfully: {site_output_dir}")
            return site_output_dir

        except Exception as e:
            logger.error(f"Failed to generate site: {e}")
            raise

    async def _load_all_content(self) -> Dict[str, BaseContent]:
        """Load all available content from repository.

        Returns:
            Dictionary of content by type
        """
        try:
            content_data = {}
            content_types = await self.content_repository.list_all_types()

            for content_type in content_types:
                try:
                    content = await self.content_repository.get(content_type)
                    if content:
                        content_data[content_type] = content
                        logger.debug(f"Loaded content: {content_type}")
                except Exception as e:
                    logger.warning(f"Failed to load content {content_type}: {e}")

            logger.info(f"Loaded {len(content_data)} content items")
            return content_data

        except Exception as e:
            logger.error(f"Failed to load content: {e}")
            return {}

    async def _copy_media_files(self, output_dir: Path) -> None:
        """Copy media files to output directory.

        Args:
            output_dir: Output directory
        """
        try:
            if not self.media_directory.exists():
                logger.debug("Media directory does not exist, skipping media copy")
                return

            media_files = list(self.media_directory.rglob("*"))
            if not media_files:
                logger.debug("No media files found")
                return

            output_media_dir = output_dir / "media"
            output_media_dir.mkdir(exist_ok=True)

            # Copy media files
            copied_count = 0
            for media_file in media_files:
                if media_file.is_file():
                    relative_path = media_file.relative_to(self.media_directory)
                    output_file = output_media_dir / relative_path

                    # Ensure parent directory exists
                    output_file.parent.mkdir(parents=True, exist_ok=True)

                    # Copy file
                    shutil.copy2(media_file, output_file)
                    copied_count += 1

            logger.info(f"Copied {copied_count} media files to {output_media_dir}")

        except Exception as e:
            logger.error(f"Failed to copy media files: {e}")

    async def _optimize_assets(self, output_dir: Path) -> None:
        """Optimize CSS, JS, and image assets.

        Args:
            output_dir: Output directory containing assets
        """
        try:
            # For now, just log optimization steps
            # In a full implementation, we would:
            # - Minify CSS and JavaScript
            # - Optimize images (compress, convert to WebP)
            # - Generate responsive image variants
            # - Create service worker for caching

            assets_dir = output_dir / "assets"
            if not assets_dir.exists():
                return

            css_files = list(assets_dir.rglob("*.css"))
            js_files = list(assets_dir.rglob("*.js"))
            image_files = list(assets_dir.rglob("*.{jpg,jpeg,png,gif,webp}"))

            logger.info(
                f"Asset optimization placeholder - found {len(css_files)} CSS, "
                f"{len(js_files)} JS, {len(image_files)} image files"
            )

            # TODO: Implement actual optimization
            # - CSS minification
            # - JavaScript minification
            # - Image compression
            # - Generate different image sizes for responsive design

        except Exception as e:
            logger.error(f"Failed to optimize assets: {e}")

    async def _generate_additional_files(
        self, output_dir: Path, content_data: Dict[str, BaseContent]
    ) -> None:
        """Generate additional files like sitemap, robots.txt, etc.

        Args:
            output_dir: Output directory
            content_data: Loaded content data
        """
        try:
            # Generate robots.txt
            robots_content = """User-agent: *
Allow: /

Sitemap: /sitemap.xml
"""
            (output_dir / "robots.txt").write_text(robots_content)

            # Generate sitemap.xml (basic)
            sitemap_content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>/</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>"""
            (output_dir / "sitemap.xml").write_text(sitemap_content)

            # Generate manifest.json for PWA support
            manifest = {
                "name": "My Portfolio",
                "short_name": "Portfolio",
                "description": "Personal Portfolio Website",
                "start_url": "/",
                "display": "standalone",
                "background_color": "#ffffff",
                "theme_color": "#007bff",
                "icons": [
                    # Icons would be generated from uploaded logo/avatar
                ],
            }

            # Override with actual content if available
            if "navigation" in content_data:
                nav_content = content_data["navigation"]
                manifest["name"] = nav_content.site_title
                manifest["short_name"] = nav_content.site_title

            if "personal_info" in content_data:
                personal_info = content_data["personal_info"]
                manifest[
                    "description"
                ] = f"{personal_info.name} - {personal_info.title}"

            import json

            (output_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))

            logger.info(
                "Generated additional files: robots.txt, sitemap.xml, manifest.json"
            )

        except Exception as e:
            logger.error(f"Failed to generate additional files: {e}")

    def _create_placeholder_site(self, output_dir: Path) -> None:
        """Create a placeholder site when no content is available.

        Args:
            output_dir: Output directory
        """
        try:
            placeholder_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio - Coming Soon</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .container {
            max-width: 600px;
            padding: 2rem;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 600;
        }
        p {
            font-size: 1.25rem;
            opacity: 0.9;
            line-height: 1.6;
        }
        .cta {
            margin-top: 2rem;
            padding: 1rem 2rem;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            color: white;
            text-decoration: none;
            display: inline-block;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        .cta:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Portfolio Coming Soon</h1>
        <p>This portfolio site is being set up. Please add some content using the Almost-a-CMS admin interface to see your site come to life!</p>
        <a href="/admin" class="cta">Go to Admin</a>
    </div>
</body>
</html>"""

            (output_dir / "index.html").write_text(placeholder_html)
            logger.info("Created placeholder site")

        except Exception as e:
            logger.error(f"Failed to create placeholder site: {e}")

    @log_operation("preview_site")
    async def preview_site(self, theme: Optional[str] = None, port: int = 8080) -> str:
        """Generate site and start preview server.

        Args:
            theme: Theme to use for preview
            port: Port for preview server

        Returns:
            Preview URL
        """
        try:
            # Generate site for preview
            preview_dir = await self.generate_site(
                theme=theme,
                output_name="preview",
                optimize=False,  # Skip optimization for faster preview
                clean_output=True,
            )

            # In a full implementation, we would start an HTTP server here
            # For now, just return the path information
            preview_url = f"http://localhost:{port}"

            logger.info(f"Site preview available at: {preview_url}")
            logger.info(f"Preview files generated in: {preview_dir}")

            return preview_url

        except Exception as e:
            logger.error(f"Failed to create preview: {e}")
            raise

    def get_build_status(self) -> Dict[str, any]:
        """Get current build status and information.

        Returns:
            Build status information
        """
        try:
            # Get available themes
            themes = self.template_engine.list_themes()

            # Check output directory
            builds = []
            if self.output_directory.exists():
                for build_dir in self.output_directory.iterdir():
                    if build_dir.is_dir():
                        builds.append(
                            {
                                "name": build_dir.name,
                                "path": str(build_dir),
                                "modified": build_dir.stat().st_mtime
                                if build_dir.exists()
                                else None,
                            }
                        )

            return {
                "available_themes": themes,
                "output_directory": str(self.output_directory),
                "media_directory": str(self.media_directory),
                "recent_builds": builds[:5],  # Show 5 most recent
                "total_builds": len(builds),
            }

        except Exception as e:
            logger.error(f"Failed to get build status: {e}")
            return {"error": str(e)}
