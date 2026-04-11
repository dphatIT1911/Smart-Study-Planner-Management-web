from typing import List, Optional
from sqlalchemy import ForeignKey, String, Float, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    semester: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    credits: Mapped[int] = mapped_column(Integer)
    target_score: Mapped[float] = mapped_column(Float)
    color: Mapped[str] = mapped_column(String)
    
    is_done: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    owner: Mapped["User"] = relationship(back_populates="subjects")
    # Modified cascade to allow reassignment logic in service layer
    tasks: Mapped[List["Task"]] = relationship(
        back_populates="subject"
    )
