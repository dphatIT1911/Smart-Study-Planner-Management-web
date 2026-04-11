from datetime import datetime
from typing import List, Optional
from sqlalchemy import ForeignKey, String, Float, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.helpers.utils import get_current_utc_time, ensure_aware

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
    
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    @property
    def is_finished(self) -> bool:
        """Dynamically determine if the subject's end_date has passed UTC now."""
        now = get_current_utc_time()
        # Ensure we are comparing aware datetimes
        end_dt = ensure_aware(self.end_date)
        return now > end_dt

    # Relationships
    owner: Mapped["User"] = relationship(back_populates="subjects")
    # Modified cascade to allow reassignment logic in service layer
    tasks: Mapped[List["Task"]] = relationship(
        back_populates="subject"
    )
