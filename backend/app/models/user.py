from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    timezone: Mapped[Optional[str]] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    subjects: Mapped[List["Subject"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
    tasks: Mapped[List["Task"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
