from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

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
