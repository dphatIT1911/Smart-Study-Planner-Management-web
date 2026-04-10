from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError

from app.core.config import settings

class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, exclude_paths: list = None):
        super().__init__(app)
        # Paths that do not require authentication
        self.exclude_paths = set(exclude_paths or [
            "/", "/health", "/docs", "/redoc", "/openapi.json", 
            "/auth/login", "/auth/register", "/auth/login/", "/auth/register/"
        ])

    async def dispatch(self, request: Request, call_next):
        # Allow pre-flight requests and excluded paths
        # Sanitize path to handle potential double slashes like //auth/login
        path = request.url.path.replace("//", "/")
        
        # Check if the path is in the exclude list (exact or with/without trailing slash)
        # or if it's an auth endpoint (often we want to allow all login/register)
        is_excluded = (
            path in self.exclude_paths or 
            path.rstrip("/") in self.exclude_paths or 
            path.startswith("/auth/")
        )
        
        if request.method == "OPTIONS" or is_excluded:
            return await call_next(request)
        
        # Check Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Missing authorization token"}
            )
        
        parts = auth_header.split(" ")
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid authorization token format. Use 'Bearer <token>'"}
            )
        
        token = parts[1]
        try:
            # Decode the JWT token to ensure it is valid
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            # Attach the user id (sub) to request state so downstream can use it if needed
            request.state.user_email = payload.get("sub")
        except JWTError:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Could not validate credentials"}
            )
        
        response = await call_next(request)
        return response
