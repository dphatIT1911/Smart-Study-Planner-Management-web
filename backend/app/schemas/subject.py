from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from typing import Optional
from datetime import datetime, timezone
from app.helpers.utils import get_current_utc_time

class SubjectBase(BaseModel):
    name: str = Field(...)
    semester: str = Field(...)
    credits: int = Field(..., ge=1, le=10)
    target_score: float = Field(...)
    color: str = Field(..., pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", description="Hex color code")
    start_date: datetime
    end_date: datetime

class SubjectCreate(SubjectBase):
    user_id: int 

    @field_validator("start_date")
    @classmethod
    def start_date_not_in_past(cls, v: datetime) -> datetime:
        # Normalize to UTC for comparison
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        
        if v < get_current_utc_time():
            raise ValueError("start_date cannot be in the past")
        return v

    @model_validator(mode="after")
    def end_date_after_start_date(self) -> "SubjectCreate":
        if self.end_date <= self.start_date:
            raise ValueError("end_date must be strictly after start_date")
        return self

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    semester: Optional[str] = None
    credits: Optional[int] = Field(None, ge=1, le=10)
    target_score: Optional[float] = None
    color: Optional[str] = Field(None, pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    @model_validator(mode="after")
    def end_date_after_start_date(self) -> "SubjectUpdate":
        if self.start_date and self.end_date:
            if self.end_date <= self.start_date:
                raise ValueError("end_date must be strictly after start_date")
        return self

class SubjectResponse(SubjectBase):
    id: int
    user_id: int
    is_finished: bool
    
    model_config = ConfigDict(from_attributes=True)
