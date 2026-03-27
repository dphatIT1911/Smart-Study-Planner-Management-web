from typing import List, Optional
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from app.core.config import settings
import os

class EmailService:
    def __init__(self):
        self.conf = ConnectionConfig(
            MAIL_USERNAME=settings.SMTP_USER,
            MAIL_PASSWORD=settings.SMTP_PASSWORD,
            MAIL_FROM=settings.EMAILS_FROM_EMAIL,
            MAIL_PORT=settings.SMTP_PORT,
            MAIL_SERVER=settings.SMTP_HOST,
            MAIL_FROM_NAME=settings.EMAILS_FROM_NAME,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True,
            TEMPLATE_FOLDER=os.path.join(os.path.dirname(__file__), "../templates/email")
        )
        self.fm = FastMail(self.conf)

    async def send_email(
        self, 
        email_to: str, 
        subject: str, 
        body: str, 
        template_name: Optional[str] = None,
        template_body: Optional[dict] = None
    ):
        message = MessageSchema(
            subject=subject,
            recipients=[email_to],
            body=body,
            subtype=MessageType.html if template_name else MessageType.plain
        )
        
        if template_name:
            await self.fm.send_message(message, template_name=template_name)
        else:
            await self.fm.send_message(message)

email_service = EmailService()
