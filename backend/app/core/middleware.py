from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError

from app.core.config import settings

class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, exclude_paths: list = None):
        super().__init__(app)
        # Paths that do not require authentication
        self.exclude_paths = exclude_paths or ["/", "/health", "/docs", "/openapi.json", "/auth/login", "/auth/register"]

    async def dispatch(self, request: Request, call_next):
        # Allow pre-flight requests and excluded paths
        if request.method == "OPTIONS" or request.url.path in self.exclude_paths:
            return await call_next(request)
        
        # Check Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Missing or invalid authorization token"}
            )
        
        token = auth_header.split(" ")[1]
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
