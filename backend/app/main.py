from fastapi import FastAPI
from app.core.config import settings
from app.api import api_router
from app.db.session import engine
from app.models.base import Base
# Import all models here so that Base.metadata.create_all recognizes them
import app.models

def create_app() -> FastAPI:
    """Initialize the FastAPI application."""
    
    # Create tables (For production with Alembic, better to remove this and use migrations)
    import os
    if not os.getenv("TESTING"):
        Base.metadata.create_all(bind=engine)

    app = FastAPI(
        title="Smart Study Planner API",
        description="A smart study planner backend applying clean layered architecture",
        version="1.0.0",
    )
    
    # Middleware imports
    from fastapi.middleware.cors import CORSMiddleware
    from app.core.middleware import AuthMiddleware

    # AuthMiddleware is added first (inner)
    app.add_middleware(AuthMiddleware)

    # CORSMiddleware is added last to wrap all inner middlewares (Auth, etc.)
    # Build specific origins
    origins = [str(o).rstrip("/") for o in settings.BACKEND_CORS_ORIGINS]
    
    # Use a more robust CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins if "*" not in origins else ["*"],
        allow_origin_regex=r"https?://.*\.onrender\.com" if "*" in origins else None,
        allow_credentials=True if "*" not in origins else False,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    # Include all API routers
    app.include_router(api_router, prefix="")

    return app

app = create_app()

@app.get("/")
def read_root():
    return {"message": "Welcome to Smart Study Planner API"}

@app.get("/health", tags=["System"])
def health_check():
    """Basic health check endpoint."""
    return {"status": "ok", "app": settings.PROJECT_NAME}
