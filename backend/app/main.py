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
    Base.metadata.create_all(bind=engine)

    app = FastAPI(
        title="Smart Study Planner API",
        description="A smart study planner backend applying clean layered architecture",
        version="1.0.0",
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
