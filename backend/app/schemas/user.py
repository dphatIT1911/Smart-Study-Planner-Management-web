from pydantic import BaseModel, ConfigDict, Field, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=3, max_length=100)
    timezone: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    confirm_password: Optional[str] = Field(None, min_length=8)

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    timezone: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)

class UserResponse(UserBase):
    id: int
    created_at: datetime
    streak_count: int = 0
    streak_active: bool = False
    
    model_config = ConfigDict(from_attributes=True)
