import sys
import os
from datetime import datetime, timedelta, timezone

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.subject import Subject
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.study_session import StudySession
from app.models.notification import Notification
from app.core.security import get_password_hash

def seed_data():
    db = SessionLocal()
    try:
        # Find user
        email = "vphat545@gmail.com"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User {email} not found. Creating user with password '12345678'...")
            user = User(
                email=email,
                password_hash=get_password_hash("12345678"),
                name="Võ Đại Phát",
                streak_count=5,
                last_activity_date=datetime.now(timezone.utc),
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        print(f"Found/created user: {user.email}. Generating mock data...")

        # 1. Update User Streak
        user.streak_count = 5
        user.streak_lost_at = None
        user.last_login_date = datetime.now(timezone.utc).date()
        db.add(user)

        # 2. Clear old mock data for this user to avoid duplicates (optional but good for clean demo)
        db.query(Notification).filter(Notification.user_id == user.id).delete()
        # StudySession is linked to Task, not User directly. So we delete sessions via tasks.
        tasks_ids = [t.id for t in db.query(Task.id).filter(Task.user_id == user.id).all()]
        if tasks_ids:
            db.query(StudySession).filter(StudySession.task_id.in_(tasks_ids)).delete(synchronize_session=False)
        db.query(Task).filter(Task.user_id == user.id).delete()
        db.query(Subject).filter(Subject.user_id == user.id).delete()
        db.commit()

        # 3. Create Subjects
        subjects = [
            Subject(name="Lập trình Web (React/Node)", semester="Học kỳ 1 2026", credits=3, target_score=9.0, color="#3b82f6", user_id=user.id),
            Subject(name="Trí tuệ Nhân tạo (AI)", semester="Học kỳ 1 2026", credits=3, target_score=8.5, color="#8b5cf6", user_id=user.id),
            Subject(name="Tiếng Anh Giao tiếp", semester="Học kỳ 1 2026", credits=2, target_score=8.0, color="#10b981", user_id=user.id)
        ]
        db.add_all(subjects)
        db.commit()
        
        web_subj = subjects[0]
        ai_subj = subjects[1]
        eng_subj = subjects[2]

        now = datetime.now(timezone.utc)

        # 4. Create Tasks
        tasks = [
            # Web
            Task(title="Làm đồ án cuối kỳ Web", description="Xây dựng Smart Study Planner", status=TaskStatus.IN_PROGRESS, priority=TaskPriority.HIGH, due_date=now + timedelta(days=2), estimated_minutes=300, subject_id=web_subj.id, user_id=user.id),
            Task(title="Nộp báo cáo tiến độ", description="Viết doc báo cáo tuần 5", status=TaskStatus.DONE, priority=TaskPriority.MED, due_date=now - timedelta(days=1), estimated_minutes=60, actual_minutes=50, subject_id=web_subj.id, user_id=user.id),
            
            # AI
            Task(title="Huấn luyện mô hình YOLOv8", description="Tìm dataset và train model nhận diện biển báo", status=TaskStatus.TODO, priority=TaskPriority.HIGH, due_date=now + timedelta(hours=15), estimated_minutes=180, subject_id=ai_subj.id, user_id=user.id),
            Task(title="Đọc paper ResNet", description="Đọc và tóm tắt kiến trúc", status=TaskStatus.DONE, priority=TaskPriority.LOW, due_date=now - timedelta(days=2), estimated_minutes=120, actual_minutes=140, subject_id=ai_subj.id, user_id=user.id),
            
            # English
            Task(title="Học 50 từ vựng Unit 7", description="Dùng flashcard để học", status=TaskStatus.TODO, priority=TaskPriority.MED, due_date=now + timedelta(days=1), estimated_minutes=45, subject_id=eng_subj.id, user_id=user.id)
        ]
        db.add_all(tasks)
        db.commit()

        main_web_task = tasks[0]

        # Add subtasks to the main Web task to demonstrate AI Breakdown feature
        subtasks = [
            Task(title="Thiết kế Database Schema", status=TaskStatus.DONE, priority=TaskPriority.MED, parent_id=main_web_task.id, subject_id=web_subj.id, user_id=user.id),
            Task(title="Làm API Backend", status=TaskStatus.DONE, priority=TaskPriority.HIGH, parent_id=main_web_task.id, subject_id=web_subj.id, user_id=user.id),
            Task(title="Code giao diện Frontend React", status=TaskStatus.IN_PROGRESS, priority=TaskPriority.HIGH, parent_id=main_web_task.id, subject_id=web_subj.id, user_id=user.id),
            Task(title="Ghép API và test", status=TaskStatus.TODO, priority=TaskPriority.MED, parent_id=main_web_task.id, subject_id=web_subj.id, user_id=user.id)
        ]
        db.add_all(subtasks)
        db.commit()

        # 5. Create Study Sessions (to show streak, graphs, average time)
        sessions = [
            # Today
            StudySession(task_id=tasks[0].id, start_time=now - timedelta(hours=2), end_time=now - timedelta(hours=1, minutes=10), duration_minutes=50),
            StudySession(task_id=tasks[2].id, start_time=now - timedelta(hours=4), end_time=now - timedelta(hours=3, minutes=35), duration_minutes=25),
            
            # Yesterday
            StudySession(task_id=tasks[1].id, start_time=now - timedelta(days=1, hours=3), end_time=now - timedelta(days=1, hours=2), duration_minutes=60),
            StudySession(task_id=tasks[3].id, start_time=now - timedelta(days=1, hours=5), end_time=now - timedelta(days=1, hours=2, minutes=30), duration_minutes=150),

            # 2 days ago
            StudySession(task_id=tasks[4].id, start_time=now - timedelta(days=2, hours=8), end_time=now - timedelta(days=2, hours=7, minutes=15), duration_minutes=45),
            
            # 3 days ago
            StudySession(task_id=tasks[0].id, start_time=now - timedelta(days=3, hours=10), end_time=now - timedelta(days=3, hours=8, minutes=20), duration_minutes=100),
            
            # 4 days ago
            StudySession(task_id=tasks[0].id, start_time=now - timedelta(days=4, hours=20), end_time=now - timedelta(days=4, hours=19, minutes=30), duration_minutes=30)
        ]
        db.add_all(sessions)
        db.commit()

        # 6. Create Notifications
        vn_time = (now + timedelta(hours=15)).astimezone() # Target time for YOLO task
        time_str = vn_time.strftime("%H:%M ngày %d/%m/%Y")
        
        notifications = [
            Notification(user_id=user.id, title="Deadline Sắp Tới!", message=f"Task 'Huấn luyện mô hình YOLOv8' của môn 'Trí tuệ Nhân tạo (AI)' sẽ hết hạn vào {time_str}.", is_read=False, created_at=now - timedelta(minutes=5)),
            Notification(user_id=user.id, title="Chào mừng trở lại!", message="Bạn đang giữ chuỗi học tập 5 ngày liên tiếp. Cố gắng phát huy nhé! 🔥", is_read=True, created_at=now - timedelta(hours=2)),
            Notification(user_id=user.id, title="Hoàn thành xuất sắc", message="Bạn đã hoàn thành Task 'Nộp báo cáo tiến độ' sớm hơn dự kiến. Bíp Bíp tặng bạn 1 tràng pháo tay!", is_read=True, created_at=now - timedelta(days=1))
        ]
        db.add_all(notifications)
        db.commit()

        print("Successfully generated mock data for demo!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
