"""Web routes for basic UI."""

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from config import settings

router = APIRouter()

# Templates setup (will be configured with theme system later)
templates = Jinja2Templates(directory=str(settings.template_directory))


@router.get("/", response_class=HTMLResponse)
async def home(request: Request) -> HTMLResponse:
    """Home page - shows basic admin interface."""
    return templates.TemplateResponse(
        "admin/index.html",
        {
            "request": request,
            "title": "Almost-a-CMS Admin",
            "app_name": settings.app_name,
            "version": settings.app_version,
        },
    )


@router.get("/admin", response_class=HTMLResponse)
async def admin_dashboard(request: Request) -> HTMLResponse:
    """Admin dashboard."""
    return templates.TemplateResponse(
        "admin/dashboard.html",
        {
            "request": request,
            "title": "Admin Dashboard",
            "app_name": settings.app_name,
        },
    )


@router.get("/admin/content/{content_type}", response_class=HTMLResponse)
async def edit_content(request: Request, content_type: str) -> HTMLResponse:
    """Content editing interface."""
    return templates.TemplateResponse(
        "admin/edit_content.html",
        {
            "request": request,
            "title": f"Edit {content_type.title()}",
            "content_type": content_type,
            "app_name": settings.app_name,
        },
    )


@router.get("/preview", response_class=HTMLResponse)
async def preview_site(request: Request) -> HTMLResponse:
    """Preview the generated site."""
    return templates.TemplateResponse(
        "preview/site.html",
        {
            "request": request,
            "title": "Site Preview",
            "app_name": settings.app_name,
        },
    )
