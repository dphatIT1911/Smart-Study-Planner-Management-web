from database import SessionLocal, engine, Base
from models import User, Subject, Task, StudySession
from datetime import datetime, timedelta

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Check if data exists
if not db.query(User).first():
    # User
    user = User(email="test@student.com", password_hash="hash", name="Test User", timezone="UTC")
    db.add(user)
    db.commit()
    db.refresh(user)

    # Subject
    subject = Subject(user_id=user.id, name="Toán Cao Cấp", credits=3, target_score=8.5, color="#FF0000")
    db.add(subject)
    db.commit()
    db.refresh(subject)

    # Task
    task = Task(subject_id=subject.id, user_id=user.id, title="Giải đề cương", priority="High")
    db.add(task)
    db.commit()
    db.refresh(task)

    # Study Sessions
    now = datetime.now()
    # Hôm nay: 25 phút
    sess1 = StudySession(task_id=task.id, start_time=now, duration_minutes=25)
    # Tuần trước: 50 phút
    sess2 = StudySession(task_id=task.id, start_time=now - timedelta(days=7), duration_minutes=50)
    # Tháng trước: 100 phút
    sess3 = StudySession(task_id=task.id, start_time=now - timedelta(days=30), duration_minutes=100)
    
    db.add_all([sess1, sess2, sess3])
    db.commit()
    print("Dummy data seeded successfully!")
else:
    print("Database already contains data.")

db.close()
