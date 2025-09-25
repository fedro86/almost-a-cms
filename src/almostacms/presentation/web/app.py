"""FastAPI application setup with security middleware."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings

from .middleware.csrf import CSRFMiddleware
from .middleware.security import SecurityHeadersMiddleware
from .routes import api_router, web_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler."""
    # Startup
    print(f"🚀 {settings.app_name} v{settings.app_version} starting up...")
    print(f"📁 Content directory: {settings.content_directory}")
    print(f"🎨 Theme directory: {settings.theme_directory}")

    yield

    # Shutdown
    print("👋 Shutting down...")


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="A user-friendly static site CMS for personal portfolios",
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        lifespan=lifespan,
    )

    # Security middleware (order matters!)

    # Trusted hosts
    if not settings.debug:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"],
        )

    # Security headers
    app.add_middleware(SecurityHeadersMiddleware)

    # CSRF protection
    app.add_middleware(
        CSRFMiddleware,
        secret_key=settings.secret_key,
        cookie_name="csrftoken",
        header_name="X-CSRFToken",
        exempt_urls=["/docs", "/redoc", "/openapi.json"],
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["X-CSRFToken"],
    )

    # Mount static files
    if settings.static_directory.exists():
        app.mount(
            "/static",
            StaticFiles(directory=str(settings.static_directory)),
            name="static",
        )

    if settings.media_directory.exists():
        app.mount(
            "/media", StaticFiles(directory=str(settings.media_directory)), name="media"
        )

    # Include routers
    app.include_router(api_router, prefix="/api", tags=["API"])
    app.include_router(web_router, tags=["Web"])

    return app


# Create application instance
app = create_app()
