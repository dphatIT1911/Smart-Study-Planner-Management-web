import logging
import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import SessionLocal
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.models.subject import Subject
from app.services.email import send_deadline_email

logger = logging.getLogger(__name__)

async def check_and_send_deadline_reminders():
    """
    Checks for tasks due in the next 24 hours and sends an email reminder if not sent yet.
    This function will be triggered by APScheduler.
    """
    logger.info("Starting deadline reminder job...")
    db: Session = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        target_time = now + timedelta(hours=24)

        # Query tasks that are due within 24h, not done, and reminder not sent
        tasks = db.query(Task).filter(
            Task.status != TaskStatus.DONE,
            Task.due_date != None,
            Task.due_date > now,
            Task.due_date <= target_time,
            Task.reminder_sent == False
        ).all()
        
        if not tasks:
            logger.info("No tasks found requiring deadline reminders.")
            return

        logger.info(f"Found {len(tasks)} task(s) approaching deadline. Sending emails...")
        
        for task in tasks:
            user = db.query(User).filter(User.id == task.user_id).first()
            if not user or not user.email:
                continue
                
            subject = db.query(Subject).filter(Subject.id == task.subject_id).first()
            subject_name = subject.name if subject else "Công việc cá nhân"
            user_name = user.name or "Bạn"
            
            # Format the due date beautifully for VN timezone
            # We don't have pytz, so we format basic UTC+7 manually or just display raw
            due_date_str = task.due_date.astimezone().strftime('%H:%M %d/%m/%Y')
            
            success = await send_deadline_email(
                email=user.email,
                user_name=user_name,
                task_title=task.title,
                due_date=due_date_str,
                subject_name=subject_name
            )
            
            if success:
                task.reminder_sent = True
                db.add(task)
                
        db.commit()
        logger.info("Deadline reminder job completed.")
    except Exception as e:
        logger.error(f"Error in deadline reminder job: {e}")
        db.rollback()
    finally:
        db.close()

def run_deadline_job_sync():
    """Wrapper to run the async job synchronously from APScheduler"""
    asyncio.run(check_and_send_deadline_reminders())
