from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session, joinedload
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.services.email import email_service
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    async def check_and_send_deadline_reminders(db: Session):
        """
        Scans for tasks whose deadline is within the next 24 hours 
        and haven't had a reminder sent yet.
        """
        now = datetime.now(timezone.utc).replace(tzinfo=None) # Assume DB stores UTC without tzinfo
        reminder_window = now + timedelta(minutes=10)
        
        # Query tasks:
        # 1. Due date is within the next 10 minutes
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
            logger.info("No deadlines approaching in the next 24h.")
            return
            
        logger.info(f"Found {len(tasks_to_remind)} tasks needing reminders.")
        
        for task in tasks_to_remind:
            try:
                # Convert to Vietnam Time (GMT+7) for display
                vn_time = task.due_date + timedelta(hours=7)
                
                # Send the email
                await email_service.send_deadline_reminder(
                    email_to=task.user.email,
                    name=task.user.name or "Student",
                    task_title=task.title,
                    due_date=vn_time.strftime("%d-%m-%Y %H:%M"),
                    subject_name=task.subject.name if task.subject else "General",
                    description=task.description or "",
                    app_url=settings.FRONTEND_URL
                )
                
                # Mark as sent
                task.reminder_sent = True
                db.add(task)
                logger.info(f"Sent deadline reminder for task: {task.title} to {task.user.email}")
                
            except Exception as e:
                logger.error(f"Failed to send reminder for task {task.id}: {str(e)}")
        
        db.commit()

notification_service = NotificationService()
