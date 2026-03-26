from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

class SubjectBase(BaseModel):
    name: str = Field(...)
    semester: str = Field(...)
    credits: int = Field(..., ge=1, le=10)
    target_score: float = Field(...)
    color: str = Field(..., pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", description="Hex color code")

class SubjectCreate(SubjectBase):
    user_id: int 

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    semester: Optional[str] = None
    credits: Optional[int] = Field(None, ge=1, le=10)
    target_score: Optional[float] = None
    color: Optional[str] = Field(None, pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")

class SubjectResponse(SubjectBase):
    id: int
    user_id: int
    
    model_config = ConfigDict(from_attributes=True)
