from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional

class StudySessionBase(BaseModel):
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=0)

class StudySessionCreate(StudySessionBase):
    task_id: int

class StudySessionUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=0)

class StudySessionResponse(StudySessionBase):
    id: int
    task_id: int
    
    model_config = ConfigDict(from_attributes=True)
