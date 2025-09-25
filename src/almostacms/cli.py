"""Command-line interface for Almost-a-CMS."""

from pathlib import Path
from typing import Optional

import typer
import uvicorn
from rich.console import Console
from rich.table import Table

from config import settings

app = typer.Typer(
    name="almostacms",
    help="Almost-a-CMS: A user-friendly static site CMS for personal portfolios",
    add_completion=False,
)
console = Console()


@app.command()
def serve(
    host: str = typer.Option(default=None, help="Host to bind to"),
    port: int = typer.Option(default=None, help="Port to bind to"),
    reload: bool = typer.Option(default=None, help="Enable auto-reload"),
    debug: bool = typer.Option(default=None, help="Enable debug mode"),
) -> None:
    """Start the development server."""
    # Use settings defaults if not provided
    if host is None:
        host = settings.host
    if port is None:
        port = settings.port
    if reload is None:
        reload = settings.reload
    if debug is None:
        debug = settings.debug

    console.print(
        f"🚀 Starting {settings.app_name} v{settings.app_version}", style="bold green"
    )
    console.print(f"📡 Server: http://{host}:{port}")
    console.print(f"📁 Content: {settings.content_directory}")
    console.print(f"🎨 Themes: {settings.theme_directory}")

    if debug:
        console.print("🔧 Debug mode enabled", style="yellow")

    try:
        uvicorn.run(
            "src.almostacms.presentation.web.app:app",
            host=host,
            port=port,
            reload=reload,
            reload_dirs=["src"] if reload else None,
        )
    except KeyboardInterrupt:
        console.print("\n👋 Server stopped", style="yellow")


@app.command()
def init(
    directory: Optional[Path] = typer.Argument(None, help="Directory to initialize"),
    force: bool = typer.Option(False, "--force", "-f", help="Overwrite existing files"),
) -> None:
    """Initialize a new Almost-a-CMS project."""
    target_dir = directory or Path.cwd()

    console.print(
        f"🏗️  Initializing Almost-a-CMS project in {target_dir}", style="bold blue"
    )

    # Create directory structure
    directories = [
        "data",
        "templates",
        "themes",
        "media",
        "static",
        "backups",
    ]

    for dir_name in directories:
        dir_path = target_dir / dir_name
        dir_path.mkdir(parents=True, exist_ok=True)
        console.print(f"✅ Created directory: {dir_path}")

    # Create default configuration
    config_content = """# Almost-a-CMS Configuration

# Application settings
ALMOSTACMS_APP_NAME=My Portfolio
ALMOSTACMS_DEBUG=true
ALMOSTACMS_HOST=127.0.0.1
ALMOSTACMS_PORT=8000

# Security (Change this in production!)
ALMOSTACMS_SECRET_KEY=change-me-in-production-very-important

# Site settings
ALMOSTACMS_SITE_TITLE=My Amazing Portfolio
ALMOSTACMS_SITE_DESCRIPTION=Welcome to my portfolio website
ALMOSTACMS_DEFAULT_THEME=default

# File settings
ALMOSTACMS_MAX_FILE_SIZE=10485760  # 10MB in bytes
"""

    env_file = target_dir / ".env"
    if not env_file.exists() or force:
        env_file.write_text(config_content)
        console.print(f"✅ Created configuration: {env_file}")

    console.print("🎉 Project initialized successfully!", style="bold green")
    console.print("\nNext steps:")
    console.print("1. Edit .env to configure your settings")
    console.print("2. Run 'almostacms serve' to start the development server")
    console.print("3. Open http://127.0.0.1:8000 in your browser")


@app.command()
def status() -> None:
    """Show project status and information."""
    console.print(
        f"📊 {settings.app_name} v{settings.app_version} Status", style="bold blue"
    )

    # Create status table
    table = Table(title="Configuration")
    table.add_column("Setting", style="cyan")
    table.add_column("Value", style="green")

    table.add_row("Environment", settings.environment)
    table.add_row("Debug Mode", "Enabled" if settings.debug else "Disabled")
    table.add_row("Content Directory", str(settings.content_directory))
    table.add_row("Media Directory", str(settings.media_directory))
    table.add_row("Theme Directory", str(settings.theme_directory))
    table.add_row("Default Theme", settings.default_theme)

    console.print(table)

    # Check directory status
    console.print("\n📁 Directory Status", style="bold")
    directories = [
        ("Content", settings.content_directory),
        ("Media", settings.media_directory),
        ("Templates", settings.template_directory),
        ("Themes", settings.theme_directory),
        ("Backups", settings.backup_directory),
    ]

    for name, path in directories:
        if path.exists():
            file_count = len(list(path.glob("*")))
            console.print(f"✅ {name}: {path} ({file_count} items)")
        else:
            console.print(f"❌ {name}: {path} (missing)")


@app.command()
def version() -> None:
    """Show version information."""
    console.print(f"{settings.app_name} v{settings.app_version}", style="bold green")


@app.command()
def build(
    theme: Optional[str] = typer.Option(
        None, "--theme", "-t", help="Theme to use for build"
    ),
    output: str = typer.Option("site", "--output", "-o", help="Output directory name"),
    optimize: bool = typer.Option(
        True, "--optimize/--no-optimize", help="Optimize assets"
    ),
    clean: bool = typer.Option(
        True, "--clean/--no-clean", help="Clean output directory first"
    ),
) -> None:
    """Build static site from content."""
    console.print("🏗️  Building static site...", style="bold blue")

    try:
        # Import here to avoid circular imports
        from .domain.services.content_type_registry import content_type_registry
        from .infrastructure.security import DefaultSecurityService
        from .infrastructure.storage import FileSystemContentRepository
        from .infrastructure.templates import (
            FileSystemThemeManager,
            Jinja2TemplateEngine,
            StaticSiteGenerator,
        )

        # Initialize components
        content_type_registry.initialize()

        repository = FileSystemContentRepository(
            content_directory=settings.content_directory,
            backup_directory=settings.backup_directory,
            security_service=DefaultSecurityService(),
            auto_backup=settings.auto_backup,
        )

        theme_manager = FileSystemThemeManager(settings.theme_directory)
        template_engine = Jinja2TemplateEngine(
            theme_manager=theme_manager, default_theme=theme or settings.default_theme
        )

        site_generator = StaticSiteGenerator(
            template_engine=template_engine,
            content_repository=repository,
            media_directory=settings.media_directory,
            output_directory=Path("output"),
        )

        # Build site
        import asyncio

        output_dir = asyncio.run(
            site_generator.generate_site(
                theme=theme,
                output_name=output,
                optimize=optimize,
                clean_output=clean,
            )
        )

        console.print(f"✅ Site built successfully: {output_dir}", style="bold green")
        console.print(
            f"📂 Open {output_dir}/index.html in your browser to view the site"
        )

    except Exception as e:
        console.print(f"❌ Build failed: {e}", style="bold red")
        raise typer.Exit(1)


@app.command()
def preview(
    theme: Optional[str] = typer.Option(
        None, "--theme", "-t", help="Theme to use for preview"
    ),
    port: int = typer.Option(8080, "--port", "-p", help="Port for preview server"),
) -> None:
    """Generate and preview site."""
    console.print("👁️  Generating site preview...", style="bold blue")

    try:
        from .domain.services.content_type_registry import content_type_registry
        from .infrastructure.security import DefaultSecurityService
        from .infrastructure.storage import FileSystemContentRepository
        from .infrastructure.templates import (
            FileSystemThemeManager,
            Jinja2TemplateEngine,
            StaticSiteGenerator,
        )

        # Initialize components
        content_type_registry.initialize()

        repository = FileSystemContentRepository(
            content_directory=settings.content_directory,
            backup_directory=settings.backup_directory,
            security_service=DefaultSecurityService(),
            auto_backup=settings.auto_backup,
        )

        theme_manager = FileSystemThemeManager(settings.theme_directory)
        template_engine = Jinja2TemplateEngine(
            theme_manager=theme_manager, default_theme=theme or settings.default_theme
        )

        site_generator = StaticSiteGenerator(
            template_engine=template_engine,
            content_repository=repository,
            media_directory=settings.media_directory,
            output_directory=Path("output"),
        )

        # Generate preview
        import asyncio

        preview_url = asyncio.run(
            site_generator.preview_site(
                theme=theme,
                port=port,
            )
        )

        console.print(f"✅ Preview generated", style="bold green")
        console.print(f"📂 Preview files in: output/preview/")
        console.print(f"🌐 Open output/preview/index.html in your browser")

    except Exception as e:
        console.print(f"❌ Preview failed: {e}", style="bold red")
        raise typer.Exit(1)


@app.command()
def themes(
    list_themes: bool = typer.Option(
        False, "--list", "-l", help="List available themes"
    ),
    info: Optional[str] = typer.Option(
        None, "--info", "-i", help="Show theme information"
    ),
) -> None:
    """Manage themes."""
    try:
        from .infrastructure.templates import FileSystemThemeManager

        theme_manager = FileSystemThemeManager(settings.theme_directory)

        if list_themes:
            available_themes = theme_manager.list_themes()

            if not available_themes:
                console.print("No themes found", style="yellow")
                return

            table = Table(title="Available Themes")
            table.add_column("Name", style="cyan")
            table.add_column("Status", style="green")

            for theme_name in available_themes:
                is_valid = (
                    "✅ Valid"
                    if theme_manager.validate_theme(theme_name)
                    else "❌ Invalid"
                )
                table.add_row(theme_name, is_valid)

            console.print(table)

        elif info:
            theme_info = theme_manager.get_theme_info(info)

            if not theme_info:
                console.print(f"Theme '{info}' not found", style="red")
                return

            table = Table(title=f"Theme: {info}")
            table.add_column("Property", style="cyan")
            table.add_column("Value", style="white")

            table.add_row("Name", theme_info.get("name", "Unknown"))
            table.add_row("Version", theme_info.get("version", "Unknown"))
            table.add_row(
                "Description", theme_info.get("description", "No description")
            )
            table.add_row("Author", theme_info.get("author", "Unknown"))
            table.add_row("Valid", "✅ Yes" if theme_info.get("valid") else "❌ No")
            table.add_row("Path", theme_info.get("path", ""))

            console.print(table)

        else:
            console.print(
                "Use --list to see available themes or --info <theme> for details"
            )

    except Exception as e:
        console.print(f"❌ Theme command failed: {e}", style="bold red")
        raise typer.Exit(1)


if __name__ == "__main__":
    app()
