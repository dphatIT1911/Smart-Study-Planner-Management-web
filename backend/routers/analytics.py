from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date
from database import get_db
from models import StudySession, Task
from schemas import AnalyticsSummaryResponse, AnalyticsDataPoint

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)

@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(
    user_id: int,
    group_by: str = Query("week", regex="^(week|month)$"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(
        StudySession.start_time,
        func.sum(StudySession.duration_minutes).label("total_minutes")
    ).join(Task, StudySession.task_id == Task.id).filter(Task.user_id == user_id)

    if start_date:
        query = query.filter(func.date(StudySession.start_time) >= start_date)
    if end_date:
        query = query.filter(func.date(StudySession.start_time) <= end_date)

    # Note: SQLite specific date formatting. 
    # For PostgreSQL, use func.date_trunc(group_by, StudySession.start_time)
    if group_by == "month":
        group_expr = func.strftime('%Y-%m', StudySession.start_time)
    else:
        # Week formatting (Year-Week)
        group_expr = func.strftime('%Y-%W', StudySession.start_time)
    
    query = query.with_entities(
        group_expr.label("period"),
        func.sum(StudySession.duration_minutes).label("total_minutes")
    ).group_by(group_expr).order_by(group_expr)

    results = query.all()

    data_points = [
        AnalyticsDataPoint(period=str(row.period), total_minutes=row.total_minutes or 0)
        for row in results if row.period
    ]

    return AnalyticsSummaryResponse(
        user_id=user_id,
        group_by=group_by,
        data=data_points
    )
