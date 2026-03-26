from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text)
    status = Column(String, default="To-do")
    priority = Column(String, default="Med")
    due_date = Column(DateTime)
    estimated_minutes = Column(Integer, default=0)
    actual_minutes = Column(Integer, default=0)

    user = relationship("User", back_populates="tasks")
    subject = relationship("Subject", back_populates="tasks")
    study_sessions = relationship("StudySession", back_populates="task")
