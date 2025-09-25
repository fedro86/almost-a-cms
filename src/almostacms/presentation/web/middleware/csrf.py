"""CSRF protection middleware."""

import hmac
import secrets
from typing import List, Optional

from fastapi import HTTPException, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse


class CSRFMiddleware(BaseHTTPMiddleware):
    """CSRF protection middleware for FastAPI."""

    def __init__(
        self,
        app,
        secret_key: str,
        cookie_name: str = "csrftoken",
        header_name: str = "X-CSRFToken",
        exempt_urls: Optional[List[str]] = None,
        cookie_secure: bool = False,
        cookie_httponly: bool = False,
        cookie_samesite: str = "lax",
    ):
        """Initialize CSRF middleware.

        Args:
            app: FastAPI application
            secret_key: Secret key for token generation
            cookie_name: Name of the CSRF cookie
            header_name: Name of the CSRF header
            exempt_urls: List of URLs exempt from CSRF protection
            cookie_secure: Whether to set secure flag on cookie
            cookie_httponly: Whether to set HttpOnly flag on cookie
            cookie_samesite: SameSite attribute for cookie
        """
        super().__init__(app)
        self.secret_key = secret_key.encode()
        self.cookie_name = cookie_name
        self.header_name = header_name
        self.exempt_urls = exempt_urls or []
        self.cookie_secure = cookie_secure
        self.cookie_httponly = cookie_httponly
        self.cookie_samesite = cookie_samesite

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        """Process request with CSRF protection."""
        # Skip CSRF for safe methods
        if request.method in ("GET", "HEAD", "OPTIONS", "TRACE"):
            response = await call_next(request)
            await self._set_csrf_cookie(request, response)
            return response

        # Skip CSRF for exempt URLs
        if any(request.url.path.startswith(url) for url in self.exempt_urls):
            return await call_next(request)

        # Validate CSRF token for state-changing methods
        if not await self._validate_csrf_token(request):
            return JSONResponse(
                status_code=403, content={"detail": "CSRF token missing or invalid"}
            )

        response = await call_next(request)
        await self._set_csrf_cookie(request, response)
        return response

    async def _validate_csrf_token(self, request: Request) -> bool:
        """Validate CSRF token from request."""
        # Get token from cookie
        cookie_token = request.cookies.get(self.cookie_name)
        if not cookie_token:
            return False

        # Get token from header or form data
        header_token = request.headers.get(self.header_name)
        form_token = None

        if not header_token:
            # Try to get from form data
            try:
                form_data = await request.form()
                form_token = form_data.get("csrfmiddlewaretoken")
            except Exception:
                pass

        request_token = header_token or form_token
        if not request_token:
            return False

        # Compare tokens
        return self._compare_tokens(cookie_token, request_token)

    def _compare_tokens(self, token1: str, token2: str) -> bool:
        """Safely compare two tokens."""
        try:
            return hmac.compare_digest(token1, token2)
        except Exception:
            return False

    def _generate_token(self) -> str:
        """Generate a new CSRF token."""
        token = secrets.token_urlsafe(32)
        signature = hmac.new(self.secret_key, token.encode(), "sha256").hexdigest()
        return f"{token}.{signature}"

    def _validate_token(self, token: str) -> bool:
        """Validate a CSRF token."""
        try:
            token_part, signature = token.split(".", 1)
            expected_signature = hmac.new(
                self.secret_key, token_part.encode(), "sha256"
            ).hexdigest()
            return hmac.compare_digest(signature, expected_signature)
        except (ValueError, TypeError):
            return False

    async def _set_csrf_cookie(self, request: Request, response: Response) -> None:
        """Set CSRF cookie in response."""
        # Only set cookie if it doesn't exist or is invalid
        existing_token = request.cookies.get(self.cookie_name)
        if existing_token and self._validate_token(existing_token):
            return

        # Generate new token
        token = self._generate_token()

        # Set cookie
        response.set_cookie(
            key=self.cookie_name,
            value=token,
            httponly=self.cookie_httponly,
            secure=self.cookie_secure,
            samesite=self.cookie_samesite,
            max_age=3600 * 24,  # 24 hours
        )

        # Also set in response headers for JavaScript access
        if not self.cookie_httponly:
            response.headers[self.header_name] = token
