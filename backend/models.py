from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    name = Column(String)
    timezone = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    subjects = relationship("Subject", back_populates="owner")
    tasks = relationship("Task", back_populates="user")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    credits = Column(Integer)
    target_score = Column(Float)
    color = Column(String)

    owner = relationship("User", back_populates="subjects")
    tasks = relationship("Task", back_populates="subject")

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

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    duration_minutes = Column(Integer)

    task = relationship("Task", back_populates="study_sessions")
