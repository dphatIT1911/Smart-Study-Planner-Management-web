from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    duration_minutes = Column(Integer)

    task = relationship("Task", back_populates="study_sessions")
