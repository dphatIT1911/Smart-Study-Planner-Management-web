from fastapi import APIRouter
from app.api import analytics

api_router = APIRouter()

api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
