from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import date
from app.models.study_session import StudySession
from app.models.task import Task
from app.schemas.analytics import AnalyticsDataPoint

class AnalyticsService:
    @staticmethod
    def get_summary(
        db: Session,
        user_id: int,
        group_by: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[AnalyticsDataPoint]:
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
        
        return data_points
