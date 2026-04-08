from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.base import CRUDBase
from sqlalchemy import func, select

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
            
        now = datetime.now()
        if task.due_date.tzinfo:
            now = datetime.now(timezone.utc)
            
        # Access enum value correctly
        status_value = task.status.value if hasattr(task.status, 'value') else task.status
        return status_value != "DONE" and task.due_date < now

    async def get_tasks_for_calendar(
        self, db: "AsyncSession", *, user_id: int, start_date: datetime, end_date: datetime
    ) -> List[Task]:
        from app.models.subject import Subject
        query = (
            select(self.model)
            .where(
                self.model.user_id == user_id,
                self.model.due_date.between(start_date, end_date)
            )
            .options(
                joinedload(self.model.subject).load_only(Subject.name, Subject.color)
            )
        )
        result = await db.execute(query)
        return list(result.scalars().unique().all())
        
task_service = CRUDTask(Task)
