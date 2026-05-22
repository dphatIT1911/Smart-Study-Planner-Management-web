from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import datetime, date, timezone
from enum import Enum
from app.helpers.utils import get_current_utc_time

class TaskStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"

class TaskPriority(str, Enum):
    LOW = "LOW"
    MED = "MED"
    HIGH = "HIGH"

class TaskBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=5000)
    priority: TaskPriority = TaskPriority.MED
    due_date: Optional[datetime] = None
    estimated_minutes: int = Field(0, ge=0)
    actual_minutes: int = Field(0, ge=0)

class TaskCreate(TaskBase):
    user_id: int
    subject_id: Optional[int] = None

    @field_validator("due_date")
    @classmethod
    def due_date_not_in_past(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is None:
            return v
        
        # Normalize to UTC
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
            
        if v < get_current_utc_time():
            raise ValueError("due_date cannot be in the past")
        return v

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    estimated_minutes: Optional[int] = Field(None, ge=0)
    actual_minutes: Optional[int] = Field(None, ge=0)
    subject_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    user_id: int
    subject_id: Optional[int]
    parent_id: Optional[int] = None
    status: TaskStatus
    is_overdue: bool
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class TaskCalendarResponse(BaseModel):
    id: int
    title: str
    due_date: Optional[datetime] = None
    status: TaskStatus
    priority: TaskPriority
    subject_name: Optional[str] = None
    subject_color: Optional[str] = None
    parent_id: Optional[int] = None
    is_overdue: bool
    
    model_config = ConfigDict(from_attributes=True)

# --- Busyness & Breakdown Schemas ---

class DailyBusynessScore(BaseModel):
    """Score for a single day."""
    date: date
    score: float
    task_count: int

class BusynessStatsResponse(BaseModel):
    """Response for the busyness-stats endpoint."""
    scores: List[DailyBusynessScore]

class BreakdownResponse(BaseModel):
    """Response for the auto-breakdown endpoint."""
    parent_task_id: int
    created_subtasks: List[TaskResponse]
    message: str

