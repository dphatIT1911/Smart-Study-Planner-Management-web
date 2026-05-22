from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session, joinedload
from app.models.task import Task, TaskStatus
from app.models.notification import Notification
from app.services.email import send_deadline_email
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    async def check_and_send_deadline_reminders(db: Session):
        """
        Scans for tasks whose deadline is within the next 24 hours 
        and haven't had a reminder sent yet.
        """
        now = datetime.now(timezone.utc)
        reminder_window = now + timedelta(hours=24)
        
        # Query tasks:
        # 1. Due date is within the next 24 hours
        # 2. task is not DONE
        # 3. reminder has not been sent yet
        tasks_to_remind = (
            db.query(Task)
            .options(joinedload(Task.user), joinedload(Task.subject))
            .filter(
                Task.due_date <= reminder_window,
                Task.due_date >= now,
                Task.status != TaskStatus.DONE,
                Task.reminder_sent == False
            )
            .all()
        )
        
        if not tasks_to_remind:
            return
            
        logger.info(f"Found {len(tasks_to_remind)} tasks needing reminders.")
        
        for task in tasks_to_remind:
            try:
                # Convert to Vietnam Time (GMT+7) for display
                vn_time = task.due_date + timedelta(hours=7)
                time_str = vn_time.strftime("%H:%M ngày %d/%m/%Y")
                
                # Create in-app notification
                notification = Notification(
                    user_id=task.user_id,
                    title="Deadline Sắp Tới!",
                    message=f"Task '{task.title}' của môn '{task.subject.name if task.subject else 'Chung'}' sẽ hết hạn vào {time_str}.",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(notification)
                
                # Send email notification
                user_email = task.user.email if task.user else None
                if user_email:
                    user_name = task.user.name or "Bạn"
                    subject_name = task.subject.name if task.subject else "Công việc cá nhân"
                    await send_deadline_email(
                        email=user_email,
                        user_name=user_name,
                        task_title=task.title,
                        due_date=time_str,
                        subject_name=subject_name
                    )
                
                # Mark as sent
                task.reminder_sent = True
                db.add(task)
                logger.info(f"Created notification and sent email for task: {task.title}")
                
            except Exception as e:
                logger.error(f"Failed to create notification for task {task.id}: {str(e)}")
        
        db.commit()

notification_service = NotificationService()
