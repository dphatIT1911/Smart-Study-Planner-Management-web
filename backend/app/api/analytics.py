from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from app.db.session import get_db
from app.schemas.analytics import AnalyticsSummaryResponse
from app.services.analytics import AnalyticsService

router = APIRouter()

@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(
    user_id: int,
    group_by: str = Query("week", pattern="^(week|month)$"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve analytics summary for study sessions mapped by user.
    """
    data_points = AnalyticsService.get_summary(
        db=db,
        user_id=user_id,
        group_by=group_by,
        start_date=start_date,
        end_date=end_date
    )

    return AnalyticsSummaryResponse(
        user_id=user_id,
        group_by=group_by,
        data=data_points
    )
