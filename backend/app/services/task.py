from typing import List, Optional, Union, Any, Dict
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone, timedelta, date
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.subject import Subject
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.base import CRUDBase
from sqlalchemy import func, and_
from app.helpers.utils import convert_local_to_utc, get_current_utc_time, ensure_aware

# --- Weight Maps for Busyness Scoring ---
PRIORITY_WEIGHT = {
    TaskPriority.HIGH: 3,
    TaskPriority.MED: 2,
    TaskPriority.LOW: 1,
}

STATUS_WEIGHT = {
    TaskStatus.IN_PROGRESS: 1.5,
    TaskStatus.TODO: 1.0,
    TaskStatus.DONE: 0,
}

BUSYNESS_THRESHOLD = 35


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

    # ------------------------------------------------------------------ #
    #  Task 1: Academic Busyness Scoring                                  #
    # ------------------------------------------------------------------ #

    def get_daily_busyness_score(
        self, db: Session, *, user_id: int, target_date: date
    ) -> float:
        """
        Calculate the academic busyness score for a single day.

        Formula:
            Task_Score = (Priority_Weight * Status_Weight) * (1 + Credits / 10)
        
        The daily score is the sum of all individual task scores whose
        due_date falls on `target_date`.
        """
        # Build UTC boundaries for the target date
        day_start = datetime(
            target_date.year, target_date.month, target_date.day,
            tzinfo=timezone.utc
        )
        day_end = day_start + timedelta(days=1)

        # Fetch tasks for this user on this date, eager-load Subject credits
        tasks = (
            db.query(self.model)
            .filter(
                self.model.user_id == user_id,
                self.model.due_date >= day_start,
                self.model.due_date < day_end,
            )
            .options(joinedload(self.model.subject).load_only(Subject.credits))
            .all()
        )

        total_score = 0.0
        for t in tasks:
            priority_w = PRIORITY_WEIGHT.get(t.priority, 2)
            status_w = STATUS_WEIGHT.get(t.status, 1.0)

            # Credits multiplier: use subject credits if linked, else 1.0
            if t.subject and t.subject.credits:
                credit_multiplier = 1 + t.subject.credits / 10
            else:
                credit_multiplier = 1.0

            total_score += (priority_w * status_w) * credit_multiplier

        return round(total_score, 2)

    def get_busyness_stats(
        self, db: Session, *, user_id: int, start_date: date, end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Return daily busyness scores for every day in [start_date, end_date].
        """
        results = []
        current = start_date
        while current <= end_date:
            score = self.get_daily_busyness_score(db, user_id=user_id, target_date=current)

            # Count tasks on this day
            day_start = datetime(
                current.year, current.month, current.day,
                tzinfo=timezone.utc
            )
            day_end = day_start + timedelta(days=1)
            task_count = (
                db.query(func.count(self.model.id))
                .filter(
                    self.model.user_id == user_id,
                    self.model.due_date >= day_start,
                    self.model.due_date < day_end,
                )
                .scalar()
            )

            results.append({
                "date": current,
                "score": score,
                "task_count": task_count,
            })
            current += timedelta(days=1)
        return results

    # ------------------------------------------------------------------ #
    #  Task 2: Auto-Breakdown Algorithm                                   #
    # ------------------------------------------------------------------ #

    def auto_breakdown_task(
        self, db: Session, *, task_id: int, user_id: int
    ) -> Dict[str, Any]:
        """
        Split a large Task into smaller sub-tasks and distribute them
        across "non-busy" days (daily score < BUSYNESS_THRESHOLD) within
        the date range [created_at, due_date].

        Returns a dict with parent_task_id, created_subtasks list,
        and a user-facing message.
        """
        # 1. Fetch the parent task with its subject
        parent = (
            db.query(self.model)
            .filter(self.model.id == task_id)
            .options(joinedload(self.model.subject))
            .first()
        )
        if not parent:
            raise ValueError("Task not found")
        if parent.user_id != user_id:
            raise PermissionError("Not authorized")
        if not parent.due_date:
            raise ValueError("Task must have a due_date to be broken down")

        # 2. Determine the date range
        start_dt = ensure_aware(parent.created_at) if parent.created_at else get_current_utc_time()
        end_dt = ensure_aware(parent.due_date)

        if end_dt <= start_dt:
            raise ValueError("due_date must be after created_at")

        start_d = start_dt.date()
        end_d = end_dt.date()

        # 3. For each day in range, calculate busyness and find non-busy days
        available_days: List[date] = []
        current_d = start_d
        while current_d <= end_d:
            score = self.get_daily_busyness_score(
                db, user_id=user_id, target_date=current_d
            )
            if score < BUSYNESS_THRESHOLD:
                available_days.append(current_d)
            current_d += timedelta(days=1)

        if not available_days:
            return {
                "parent_task_id": task_id,
                "created_subtasks": [],
                "message": "Không tìm thấy ngày trống để phân chia. Tất cả các ngày đều bận (score ≥ 35).",
            }

        # 4. Create sub-tasks, one per available day
        created: List[Task] = []
        for i, day in enumerate(available_days, start=1):
            # Title: "Task con của <Parent_Task_Name>"
            child_title = f"Task con của {parent.title}"
            # Truncate to 100 chars (DB constraint)
            child_title = child_title[:100]

            child = Task(
                title=child_title,
                description=f"Sub-task #{i} – auto-generated from \"{parent.title}\"",
                status=TaskStatus.TODO,
                priority=parent.priority if parent.priority else TaskPriority.MED,
                due_date=datetime(
                    day.year, day.month, day.day, 23, 59, 0, tzinfo=timezone.utc
                ),
                subject_id=parent.subject_id,
                user_id=parent.user_id,
                parent_id=parent.id,
                estimated_minutes=parent.estimated_minutes // len(available_days) if parent.estimated_minutes else 0,
            )
            db.add(child)
            created.append(child)

        db.commit()
        # Refresh to get generated IDs and created_at
        for c in created:
            db.refresh(c)

        return {
            "parent_task_id": task_id,
            "created_subtasks": created,
            "message": f"Đã tạo {len(created)} task con được phân bổ vào các ngày trống.",
        }

        
task_service = CRUDTask(Task)

