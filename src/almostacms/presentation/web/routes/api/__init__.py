"""API routes."""

from fastapi import APIRouter

from .content import router as content_router
from .system import router as system_router

# Main API router
router = APIRouter()

# Include sub-routers
router.include_router(content_router, prefix="/content", tags=["Content"])
router.include_router(system_router, prefix="/system", tags=["System"])

__all__ = ["router"]
