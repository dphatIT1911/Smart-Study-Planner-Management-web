from typing import List
from sqlalchemy.orm import Session
from app.models.subject import Subject
from app.schemas.subject import SubjectCreate, SubjectUpdate
from app.services.base import CRUDBase

class CRUDSubject(CRUDBase[Subject, SubjectCreate, SubjectUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: SubjectCreate, user_id: int
    ) -> Subject:
        obj_in_data = obj_in.model_dump()
        obj_in_data["user_id"] = user_id
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_multi_by_owner(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Subject]:
        return (
            db.query(self.model)
            .filter(self.model.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def remove(self, db: Session, *, id: int) -> Subject:
        subject = db.get(self.model, id)
        if subject:
            from app.models.task import Task
            if not subject.is_finished:
                # Reassign associated Tasks to "Uncategorized"
                db.query(Task).filter(Task.subject_id == subject.id).update(
                    {Task.subject_id: None},
                    synchronize_session=False
                )
            else:
                # If finished, proceed with default deletion behavior (delete tasks)
                db.query(Task).filter(Task.subject_id == subject.id).delete(
                    synchronize_session=False
                )
            
            db.delete(subject)
            db.commit()
        return subject

subject_service = CRUDSubject(Subject)
