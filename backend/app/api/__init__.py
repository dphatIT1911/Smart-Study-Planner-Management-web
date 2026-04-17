from fastapi import APIRouter
from app.api import analytics
from app.api import auth
from app.api import subject
from app.api import task
from app.api import study_session
from app.api import chat

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(subject.router, prefix="/subjects", tags=["subjects"])
api_router.include_router(task.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(study_session.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
