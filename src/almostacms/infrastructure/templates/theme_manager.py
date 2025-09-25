"""File system-based theme management."""

import shutil
from pathlib import Path
from typing import Dict, List, Optional

import yaml

from ..logging import get_logger

logger = get_logger(__name__)


class FileSystemThemeManager:
    """Manages themes from the file system."""

    def __init__(self, themes_directory: Path):
        """Initialize theme manager.

        Args:
            themes_directory: Directory containing themes
        """
        self.themes_directory = Path(themes_directory)
        self.themes_directory.mkdir(parents=True, exist_ok=True)

        # Ensure default theme exists
        self._ensure_default_theme()

        logger.info(f"Theme manager initialized: {self.themes_directory}")

    def _ensure_default_theme(self) -> None:
        """Create default theme if it doesn't exist."""
        default_theme_path = self.themes_directory / "default"

        if not default_theme_path.exists():
            logger.info("Creating default theme")
            self._create_default_theme(default_theme_path)

    def _create_default_theme(self, theme_path: Path) -> None:
        """Create the default theme with basic templates.

        Args:
            theme_path: Path where to create the theme
        """
        theme_path.mkdir(parents=True, exist_ok=True)

        # Create theme configuration
        theme_config = {
            "name": "Default Theme",
            "version": "1.0.0",
            "description": "Clean, professional portfolio theme",
            "author": "Almost-a-CMS Team",
            "templates": {
                "layout": "layout.html",
                "sections": {
                    "personal_info": "sections/personal_info.html",
                    "about": "sections/about.html",
                    "resume": "sections/resume.html",
                    "portfolio": "sections/portfolio.html",
                    "blog": "sections/blog.html",
                    "contact": "sections/contact.html",
                    "navigation": "sections/navigation.html",
                },
            },
            "assets": {"css": ["css/style.css"], "js": ["js/main.js"]},
            "customizable": {
                "colors": {
                    "primary": "#007bff",
                    "secondary": "#6c757d",
                    "background": "#ffffff",
                    "text": "#333333",
                },
                "typography": {
                    "font_family": "Inter, sans-serif",
                    "heading_font": "Poppins, sans-serif",
                },
            },
        }

        config_file = theme_path / "theme.yaml"
        config_file.write_text(yaml.dump(theme_config, default_flow_style=False))

        # Create templates directory
        templates_dir = theme_path / "templates"
        templates_dir.mkdir(exist_ok=True)

        # Create sections directory
        sections_dir = templates_dir / "sections"
        sections_dir.mkdir(exist_ok=True)

        # Create basic layout template
        layout_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ site_title or "Portfolio" }}</title>
    <meta name="description" content="{{ site_description or "Personal Portfolio Website" }}">

    <!-- Theme CSS -->
    {% for css_file in theme_assets.css %}
    <link rel="stylesheet" href="{{ css_file }}">
    {% endfor %}

    <!-- Custom fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div id="app">
        <!-- Navigation -->
        {{ navigation_html | safe }}

        <!-- Main Content -->
        <main class="main-content">
            {{ content | safe }}
        </main>
    </div>

    <!-- Theme JS -->
    {% for js_file in theme_assets.js %}
    <script src="{{ js_file }}"></script>
    {% endfor %}
</body>
</html>"""

        (templates_dir / "layout.html").write_text(layout_template)

        # Create basic section templates
        section_templates = {
            "personal_info.html": """
<section id="personal-info" class="hero-section">
    <div class="container">
        {% if personal_info %}
        <div class="hero-content">
            {% if personal_info.avatar %}
            <div class="avatar">
                <img src="{{ personal_info.avatar.file_path }}"
                     alt="{{ personal_info.avatar.alt_text or personal_info.name }}"
                     width="120" height="120">
            </div>
            {% endif %}

            <h1>{{ personal_info.name }}</h1>
            <h2>{{ personal_info.title }}</h2>

            {% if personal_info.tagline %}
            <p class="tagline">{{ personal_info.tagline }}</p>
            {% endif %}

            {% if personal_info.bio %}
            <p class="bio">{{ personal_info.bio }}</p>
            {% endif %}
        </div>
        {% endif %}
    </div>
</section>""",
            "about.html": """
<section id="about" class="about-section">
    <div class="container">
        {% if about %}
        <h2>{{ about.title }}</h2>

        {% for paragraph in about.description %}
        <p>{{ paragraph }}</p>
        {% endfor %}

        {% if about.services %}
        <div class="services">
            <h3>{{ about.services_title or "What I Do" }}</h3>
            <div class="services-grid">
                {% for service in about.services %}
                <div class="service-item">
                    {% if service.icon %}
                    <div class="service-icon">
                        <img src="{{ service.icon }}" alt="{{ service.title }}">
                    </div>
                    {% endif %}
                    <h4>{{ service.title }}</h4>
                    <p>{{ service.description }}</p>
                </div>
                {% endfor %}
            </div>
        </div>
        {% endif %}
        {% endif %}
    </div>
</section>""",
            "portfolio.html": """
<section id="portfolio" class="portfolio-section">
    <div class="container">
        {% if portfolio %}
        <h2>{{ portfolio.title }}</h2>

        {% if portfolio.description %}
        <p>{{ portfolio.description }}</p>
        {% endif %}

        {% if portfolio.projects %}
        <div class="projects-grid">
            {% for project in portfolio.projects %}
            <div class="project-item {% if project.featured %}featured{% endif %}">
                {% if project.featured_image %}
                <div class="project-image">
                    <img src="{{ project.featured_image.file_path }}"
                         alt="{{ project.featured_image.alt_text or project.title }}">
                </div>
                {% endif %}

                <div class="project-content">
                    <h3>{{ project.title }}</h3>
                    <p>{{ project.short_description or project.description }}</p>

                    {% if project.technologies %}
                    <div class="project-technologies">
                        {% for tech in project.technologies %}
                        <span class="tech-tag">{{ tech }}</span>
                        {% endfor %}
                    </div>
                    {% endif %}

                    <div class="project-links">
                        {% if project.project_url %}
                        <a href="{{ project.project_url }}" target="_blank" rel="noopener">View Project</a>
                        {% endif %}
                        {% if project.repository_url %}
                        <a href="{{ project.repository_url }}" target="_blank" rel="noopener">Source Code</a>
                        {% endif %}
                    </div>
                </div>
            </div>
            {% endfor %}
        </div>
        {% endif %}
        {% endif %}
    </div>
</section>""",
            "navigation.html": """
<nav class="main-navigation">
    <div class="container">
        {% if navigation %}
        <div class="nav-brand">
            {% if navigation.logo %}
            <img src="{{ navigation.logo.file_path }}" alt="{{ navigation.site_title }}">
            {% endif %}
            <span>{{ navigation.site_title }}</span>
        </div>

        <ul class="nav-menu">
            {% for item in navigation.menu_items %}
            {% if item.active %}
            <li>
                <a href="{{ item.href }}"
                   {% if item.external %}target="_blank" rel="noopener"{% endif %}>
                    {% if item.icon %}<i class="{{ item.icon }}"></i>{% endif %}
                    {{ item.label }}
                </a>
            </li>
            {% endif %}
            {% endfor %}
        </ul>
        {% endif %}
    </div>
</nav>""",
        }

        for filename, template_content in section_templates.items():
            (sections_dir / filename).write_text(template_content)

        # Create assets directories
        assets_dir = theme_path / "assets"
        css_dir = assets_dir / "css"
        js_dir = assets_dir / "js"
        images_dir = assets_dir / "images"

        for directory in [css_dir, js_dir, images_dir]:
            directory.mkdir(parents=True, exist_ok=True)

        # Create basic CSS
        basic_css = """/* Almost-a-CMS Default Theme */
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --background-color: #ffffff;
    --text-color: #333333;
    --font-family: 'Inter', sans-serif;
    --heading-font: 'Poppins', sans-serif;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-family);
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

h1, h2, h3, h4, h5, h6 {
    font-family: var(--heading-font);
    font-weight: 600;
    margin-bottom: 1rem;
}

/* Navigation */
.main-navigation {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
    padding: 1rem 0;
}

.main-navigation .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-brand {
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 1.25rem;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    text-decoration: none;
    color: var(--text-color);
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav-menu a:hover {
    color: var(--primary-color);
}

/* Main content */
.main-content {
    margin-top: 80px;
}

section {
    padding: 5rem 0;
}

.hero-section {
    text-align: center;
    padding: 8rem 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.avatar img {
    border-radius: 50%;
    border: 4px solid rgba(255, 255, 255, 0.2);
}

.tagline {
    font-size: 1.25rem;
    margin: 1rem 0;
}

/* Services Grid */
.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
}

.service-item {
    text-align: center;
    padding: 2rem;
    border-radius: 8px;
    background: #f8f9fa;
}

/* Projects Grid */
.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
}

.project-item {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.project-item:hover {
    transform: translateY(-5px);
}

.project-image img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.project-content {
    padding: 1.5rem;
}

.project-technologies {
    margin: 1rem 0;
}

.tech-tag {
    display: inline-block;
    background: var(--primary-color);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
}

.project-links a {
    display: inline-block;
    margin-right: 1rem;
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
    .nav-menu {
        display: none; /* Simplified for now */
    }

    section {
        padding: 3rem 0;
    }

    .hero-section {
        padding: 5rem 0;
    }
}"""

        (css_dir / "style.css").write_text(basic_css)

        # Create basic JavaScript
        basic_js = """// Almost-a-CMS Default Theme JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navigation
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('.main-navigation');
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
});"""

        (js_dir / "main.js").write_text(basic_js)

        logger.info(f"Default theme created at {theme_path}")

    def get_theme_path(self, theme_name: str) -> Optional[Path]:
        """Get path to theme directory."""
        theme_path = self.themes_directory / theme_name
        return theme_path if theme_path.exists() else None

    def load_theme_config(self, theme_name: str) -> Optional[Dict[str, any]]:
        """Load theme configuration from theme.yaml."""
        try:
            theme_path = self.get_theme_path(theme_name)
            if not theme_path:
                return None

            config_file = theme_path / "theme.yaml"
            if not config_file.exists():
                # Try theme.yml as fallback
                config_file = theme_path / "theme.yml"
                if not config_file.exists():
                    return None

            with open(config_file, "r", encoding="utf-8") as f:
                config = yaml.safe_load(f)

            logger.debug(f"Loaded theme config for {theme_name}")
            return config

        except Exception as e:
            logger.error(f"Failed to load theme config for {theme_name}: {e}")
            return None

    def get_template_path(self, theme_name: str, template_name: str) -> Optional[Path]:
        """Get path to specific template file."""
        theme_path = self.get_theme_path(theme_name)
        if not theme_path:
            return None

        # Check in templates directory
        templates_dir = theme_path / "templates"
        template_path = templates_dir / template_name

        if template_path.exists():
            return template_path

        # Check for section templates
        sections_dir = templates_dir / "sections"
        section_template_path = sections_dir / template_name

        if section_template_path.exists():
            return section_template_path

        return None

    def list_themes(self) -> List[str]:
        """Get list of available themes."""
        try:
            themes = []
            for theme_dir in self.themes_directory.iterdir():
                if theme_dir.is_dir():
                    # Check if it has a theme config file
                    if (theme_dir / "theme.yaml").exists() or (
                        theme_dir / "theme.yml"
                    ).exists():
                        themes.append(theme_dir.name)

            logger.debug(f"Found themes: {themes}")
            return sorted(themes)

        except Exception as e:
            logger.error(f"Failed to list themes: {e}")
            return []

    def validate_theme(self, theme_name: str) -> bool:
        """Validate that a theme exists and has required files."""
        try:
            theme_path = self.get_theme_path(theme_name)
            if not theme_path:
                return False

            # Check for theme configuration
            config = self.load_theme_config(theme_name)
            if not config:
                return False

            # Check for layout template
            layout_template = self.get_template_path(theme_name, "layout.html")
            if not layout_template:
                return False

            logger.debug(f"Theme {theme_name} is valid")
            return True

        except Exception as e:
            logger.error(f"Theme validation failed for {theme_name}: {e}")
            return False

    def get_theme_info(self, theme_name: str) -> Optional[Dict[str, any]]:
        """Get detailed information about a theme."""
        try:
            config = self.load_theme_config(theme_name)
            if not config:
                return None

            theme_path = self.get_theme_path(theme_name)

            # Build theme info
            theme_info = {
                "name": config.get("name", theme_name),
                "version": config.get("version", "1.0.0"),
                "description": config.get("description", ""),
                "author": config.get("author", "Unknown"),
                "path": str(theme_path),
                "templates": config.get("templates", {}),
                "assets": config.get("assets", {}),
                "customizable": config.get("customizable", {}),
                "valid": self.validate_theme(theme_name),
            }

            return theme_info

        except Exception as e:
            logger.error(f"Failed to get theme info for {theme_name}: {e}")
            return None
