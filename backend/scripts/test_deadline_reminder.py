import asyncio
import sys
import os
from datetime import datetime, timedelta, timezone

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.services.notification import notification_service
from app.core.config import settings

async def test_deadline_reminder():
    db = SessionLocal()
    try:
        # 1. Get any user or use the one from settings
        target_email = settings.EMAILS_FROM_EMAIL
        if not target_email or "info@smartstudy.com" in target_email:
            target_email = "vphat545@gmail.com" # Fallback to user's requested email
            
        print(f"📧 Chỉnh chuẩn: Email người nhận sẽ là: {target_email}")
        
        user = db.query(User).filter(User.email == target_email).first()
        if not user:
            # Create a temporary test user if not exists
            print(f"👤 Không tìm thấy user {target_email}, đang tạo user tạm...")
            user = User(
                email=target_email,
                name="Test Student",
                password_hash="fakehash"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        print(f"✅ Đã sẵn sàng với user: {user.email} (ID: {user.id})")
        
        # 2. Create a test task with a deadline in 5 minutes
        test_task = Task(
            user_id=user.id,
            title="🎯 TEST: Deadline cực gấp (10 phút)",
            description="Nếu bạn thấy email này, hệ thống nhắc nhở 10 phút đã hoạt động hoàn hảo!",
            status=TaskStatus.TODO,
            due_date=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=5),
            reminder_sent=False
        )
        db.add(test_task)
        db.commit()
        db.refresh(test_task)
        
        print(f"✅ Đã tạo task test: '{test_task.title}'")
        print(f"⏰ Deadline: {test_task.due_date}")
        
        # 3. Manually trigger the notification check
        print("🔔 Đang kích hoạt quét deadline...")
        await notification_service.check_and_send_deadline_reminders(db)
        
        # 4. Verify if the flag was updated
        db.refresh(test_task)
        if test_task.reminder_sent:
            print("\n🚀 CHÚC MỪNG: Flag 'reminder_sent' đã chuyển thành True!")
            print(f"📬 Vui lòng kiểm tra hộp thư {target_email} (cả mục Spam nếu cần).")
        else:
            print("\n❌ THẤT BẠI: Task vẫn chưa được đánh dấu đã gửi. Kiểm tra lại logic thời gian.")
            
        # Clean up
        db.delete(test_task)
        db.commit()
        print("🧹 Đã dọn dẹp dữ liệu test.")
        
    except Exception as e:
        print(f"\n❌ Lỗi trong quá trình test: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure we use UTC for everything
    print("--- BẮT ĐẦU TEST HỆ THỐNG NHẮC NHỞ (10 PHÚT) ---")
    asyncio.run(test_deadline_reminder())
