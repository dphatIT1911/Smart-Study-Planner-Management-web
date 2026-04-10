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
    origins = [str(o).rstrip("/") for o in settings.BACKEND_CORS_ORIGINS]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include all API routers
    app.include_router(api_router, prefix="")

    @app.on_event("startup")
    async def start_notification_scheduler():
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
                
                # Check every 1 minute (60 seconds)
                await asyncio.sleep(60)
        
        # Run in background
        asyncio.create_task(scheduled_deadline_check())

    return app

app = create_app()

@app.get("/")
def read_root():
    return {"message": "Welcome to Smart Study Planner API"}

@app.api_route("/health", methods=["GET", "HEAD"], tags=["System"])
def health_check():
    """Basic health check endpoint."""
    return {"status": "ok", "app": settings.PROJECT_NAME}
