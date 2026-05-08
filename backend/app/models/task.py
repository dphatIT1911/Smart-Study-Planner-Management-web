import enum
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import ForeignKey, String, Text, DateTime, Integer, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class TaskStatus(str, enum.Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"

class TaskPriority(str, enum.Enum):
    LOW = "LOW"
    MED = "MED"
    HIGH = "HIGH"

class Task(Base):
    __tablename__ = "tasks"

    __table_args__ = (
        Index("ix_task_user_id_due_date", "user_id", "due_date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    subject_id: Mapped[Optional[int]] = mapped_column(ForeignKey("subjects.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True
    )
    
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[TaskStatus] = mapped_column(Enum(TaskStatus), default=TaskStatus.TODO)
    priority: Mapped[TaskPriority] = mapped_column(Enum(TaskPriority), default=TaskPriority.MED)
    
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=0)
    actual_minutes: Mapped[int] = mapped_column(Integer, default=0)
    reminder_sent: Mapped[bool] = mapped_column(default=False)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="tasks")
    subject: Mapped[Optional["Subject"]] = relationship(back_populates="tasks")
    study_sessions: Mapped[List["StudySession"]] = relationship(
        back_populates="task", cascade="all, delete-orphan"
    )
    # Self-referential: parent/children for auto-breakdown sub-tasks
    parent: Mapped[Optional["Task"]] = relationship(
        back_populates="children", remote_side="Task.id"
    )
    children: Mapped[List["Task"]] = relationship(
        back_populates="parent", cascade="all, delete-orphan"
    )
