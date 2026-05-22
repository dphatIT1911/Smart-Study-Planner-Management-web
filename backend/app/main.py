from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api import api_router
from app.db.session import engine
from app.models.base import Base
import app.models

@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio
    from app.services.notification import notification_service
    from app.db.session import SessionLocal
    
    async def scheduled_deadline_check():
        while True:
            db = SessionLocal()
            try:
                await notification_service.check_and_send_deadline_reminders(db)
            except Exception as e:
                import logging
                logging.error(f"Error in scheduled deadline check: {str(e)}")
            finally:
                db.close()
            await asyncio.sleep(60)
            
    task = asyncio.create_task(scheduled_deadline_check())
    yield
    task.cancel()

def create_app() -> FastAPI:
    """Initialize the FastAPI application."""
    app = FastAPI(
        title="Smart Study Planner API",
        description="A smart study planner backend applying clean layered architecture",
        version="1.0.0",
        lifespan=lifespan
    )
    
    from fastapi.middleware.cors import CORSMiddleware
    from app.core.middleware import AuthMiddleware

    app.add_middleware(AuthMiddleware)

    origins = [str(o).rstrip("/") for o in settings.BACKEND_CORS_ORIGINS]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins + ["*"] if settings.ENVIRONMENT != "production" else origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
        allow_headers=["*"],
    )

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
