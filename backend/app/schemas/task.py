from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    TODO = "To-do"
    IN_PROGRESS = "In-progress"
    DONE = "Done"

class TaskPriority(str, Enum):
    LOW = "Low"
    MED = "Med"
    HIGH = "High"

class TaskBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=5000)
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MED
    due_date: Optional[datetime] = None
    estimated_minutes: int = Field(0, ge=0)
    actual_minutes: int = Field(0, ge=0)

class TaskCreate(TaskBase):
    user_id: int
    subject_id: Optional[int] = None

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
    is_overdue: bool
    
    model_config = ConfigDict(from_attributes=True)
