from fastapi import APIRouter
from app.api import analytics
from app.api import auth
from app.api import task

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(task.router, prefix="/tasks", tags=["tasks"])
