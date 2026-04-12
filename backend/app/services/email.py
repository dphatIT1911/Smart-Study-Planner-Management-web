from typing import List, Optional
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from app.core.config import settings
import os

class EmailService:
    def __init__(self):
        # Use absolute path for templates
        template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../templates/email"))
        
        self.conf = ConnectionConfig(
            MAIL_USERNAME=settings.SMTP_USER,
            MAIL_PASSWORD=settings.SMTP_PASSWORD,
            MAIL_FROM=settings.EMAILS_FROM_EMAIL or settings.SMTP_USER,
            MAIL_PORT=465,
            MAIL_SERVER="smtp.gmail.com",
            MAIL_FROM_NAME=settings.EMAILS_FROM_NAME,
            MAIL_STARTTLS=False,
            MAIL_SSL_TLS=True,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True,
            TEMPLATE_FOLDER=template_dir
        )
        self.fm = FastMail(self.conf)
        print(f"DEBUG: EmailService initialized with user {settings.SMTP_USER} and template dir {template_dir}")

    async def send_email(
        self, 
        email_to: str, 
        subject: str, 
        body: str, 
        template_name: Optional[str] = None,
        template_body: Optional[dict] = None
    ):
        try:
            message = MessageSchema(
                subject=subject,
                recipients=[email_to],
                body=body,
                template_body=template_body,
                subtype=MessageType.html if template_name else MessageType.plain
            )
            
            if template_name:
                await self.fm.send_message(message, template_name=template_name)
            else:
                await self.fm.send_message(message)
            print(f"DEBUG: Email sent successfully to {email_to}")
        except Exception as e:
            print(f"DEBUG ERROR: Failed to send email to {email_to}: {str(e)}")
            # Re-raise so background task knows it failed if needed, 
            # but at least we see it in logs now
            raise e

    async def send_deadline_reminder(
        self, 
        email_to: str, 
        name: str, 
        task_title: str, 
        due_date: str, 
        subject_name: str = "General",
        description: str = "",
        app_url: str = "https://smart-study-planner.web.app"
    ):
        await self.send_email(
            email_to=email_to,
            subject=f"🔔 Reminder: Task Deadline Approaching - {task_title}",
            body="", # Body is not used when template_name is set
            template_name="deadline_reminder.html",
            template_body={
                "name": name,
                "task_title": task_title,
                "due_date": due_date,
                "subject_name": subject_name,
                "description": description,
                "app_url": app_url
            }
        )

    async def send_password_reset_email(
        self, 
        email_to: str, 
        name: str, 
        reset_link: str
    ):
        await self.send_email(
            email_to=email_to,
            subject="🔑 Reset your password - Smart Study Planner",
            body="", 
            template_name="password_reset.html",
            template_body={
                "name": name,
                "reset_link": reset_link
            }
        )

email_service = EmailService()
