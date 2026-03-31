from sqlalchemy.orm import Session
from app.models.study_session import StudySession
from app.models.task import Task
from app.schemas.study_session import StudySessionCreate
from app.services.base import CRUDBase

class CRUDStudySession(CRUDBase[StudySession, StudySessionCreate, StudySessionCreate]):
    def create_session(self, db: Session, *, obj_in: StudySessionCreate, user_id: int):
        # Additional validation happens in the router directly or here if preferred
        # Let's perform the insert and update in one transaction.

        # Verify task exists and belongs to the user
        task = db.query(Task).filter(Task.id == obj_in.task_id, Task.user_id == user_id).first()
        if not task:
            return None # The router should handle the 404 or 403

        # Create session
        db_obj = StudySession(
            task_id=obj_in.task_id,
            start_time=obj_in.start_time,
            end_time=obj_in.end_time,
            duration_minutes=obj_in.duration_minutes
        )
        db.add(db_obj)

        # Accumulate actual_minutes onto the Task
        task.actual_minutes += db_obj.duration_minutes
        db.add(task)

        # Commit transaction
        db.commit()
        db.refresh(db_obj)
        
        return db_obj

study_session = CRUDStudySession(StudySession)
