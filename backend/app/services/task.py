from typing import List, Optional, Union, Any, Dict
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.base import CRUDBase
from sqlalchemy import func
from app.helpers.utils import convert_local_to_utc, get_current_utc_time, ensure_aware

class CRUDTask(CRUDBase[Task, TaskCreate, TaskUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: TaskCreate, user_id: int
    ) -> Task:
        obj_in_data = obj_in.model_dump()
        # Override the user_id internally
        obj_in_data["user_id"] = user_id
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        
        # If task is created with IN_PROGRESS status, start a session
        if db_obj.status == TaskStatus.IN_PROGRESS:
            from app.models.study_session import StudySession
            new_session = StudySession(
                task_id=db_obj.id,
                start_time=get_current_utc_time()
            )
            db.add(new_session)
            db.commit()
            
        return db_obj
    
    def get_multi_by_owner(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100,
        status: Optional[str] = None
    ) -> List[Task]:
        query = db.query(self.model).filter(self.model.user_id == user_id)
        if status:
            query = query.filter(self.model.status == status)
            
        return query.order_by(self.model.due_date.asc()).offset(skip).limit(limit).all()

    def is_overdue(self, task: Task) -> bool:
        """Dynamic calculation of overdue status if due_date is present."""
        if not task.due_date:
            return False
            
        now = get_current_utc_time()
        due_date = ensure_aware(task.due_date)
            
        # Access enum value correctly
        status_value = task.status.value if hasattr(task.status, 'value') else task.status
        return status_value != TaskStatus.DONE and due_date < now

    def update(
        self,
        db: Session,
        *,
        db_obj: Task,
        obj_in: Union[TaskUpdate, Dict[str, Any]]
    ) -> Task:
        # Check for status change
        old_status = db_obj.status
        if isinstance(obj_in, dict):
            new_status = obj_in.get("status")
        else:
            new_status = obj_in.status
            
        # Call parent update
        updated_task = super().update(db, db_obj=db_obj, obj_in=obj_in)
        
        # If status changed to IN_PROGRESS, create a study session
        if new_status == TaskStatus.IN_PROGRESS and old_status != TaskStatus.IN_PROGRESS:
            from app.models.study_session import StudySession
            
            # Check if there's already an active session
            active_session = db.query(StudySession).filter(
                StudySession.task_id == updated_task.id,
                StudySession.end_time == None
            ).first()
            
            if not active_session:
                new_session = StudySession(
                    task_id=updated_task.id,
                    start_time=get_current_utc_time()
                )
                db.add(new_session)
                db.commit()
                
        # If status changed from IN_PROGRESS to something else, close the session
        elif old_status == TaskStatus.IN_PROGRESS and new_status and new_status != TaskStatus.IN_PROGRESS:
            from app.models.study_session import StudySession
            
            active_session = db.query(StudySession).filter(
                StudySession.task_id == updated_task.id,
                StudySession.end_time == None
            ).first()
            
            if active_session:
                active_session.end_time = get_current_utc_time()
                
                # Normalize start_time
                start_time = ensure_aware(active_session.start_time)
                    
                delta = active_session.end_time - start_time
                active_session.duration_minutes = int(delta.total_seconds() / 60)
                
                # Update task actual_minutes
                updated_task.actual_minutes += active_session.duration_minutes
                db.add(updated_task)
                db.add(active_session)
                db.commit()
                
        return updated_task

    def get_tasks_for_calendar(
        self, db: Session, *, user_id: int, start_date: datetime, end_date: datetime, user_timezone: str
    ) -> List[Task]:
        from app.models.subject import Subject

        # Convert local start/end dates to UTC for query
        start_utc = convert_local_to_utc(start_date, user_timezone)
        end_utc = convert_local_to_utc(end_date, user_timezone)

        return (
            db.query(self.model)
            .filter(
                self.model.user_id == user_id,
                self.model.due_date >= start_utc,
                self.model.due_date <= end_utc,
            )
            .options(joinedload(self.model.subject).load_only(Subject.name, Subject.color))
            .all()
        )
        
task_service = CRUDTask(Task)
