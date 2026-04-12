import httpx
import os
from typing import Optional
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.api_key = os.getenv("BREVO_API_KEY")
        self.base_url = "https://api.brevo.com/v3/smtp/email"
        self.headers = {
            "api-key": self.api_key or "",
            "Content-Type": "application/json",
            "accept": "application/json"
        }
        print(f"DEBUG: EmailService initialized using {'Brevo API' if self.api_key else 'Missing BREVO_API_KEY'}")

    async def send_email(
        self, 
        email_to: str, 
        subject: str, 
        html_content: str,
        name_to: str = ""
    ):
        if not self.api_key:
            print("DEBUG ERROR: BREVO_API_KEY is missing. Cannot send email.")
            return False

        async with httpx.AsyncClient() as client:
            try:
                # Brevo allows sending from your verified Gmail address
                sender_email = settings.EMAILS_FROM_EMAIL or settings.SMTP_USER
                
                payload = {
                    "sender": {
                        "name": settings.EMAILS_FROM_NAME or "Smart Study Planner",
                        "email": sender_email
                    },
                    "to": [
                        {
                            "email": email_to,
                            "name": name_to
                        }
                    ],
                    "subject": subject,
                    "htmlContent": html_content
                }

                response = await client.post(self.base_url, json=payload, headers=self.headers)
                
                if response.status_code in (200, 201, 202):
                    print(f"DEBUG: Email sent successfully via Brevo API to {email_to}")
                    return True
                else:
                    print(f"DEBUG ERROR: Brevo API failed ({response.status_code}): {response.text}")
                    return False
            except Exception as e:
                print(f"DEBUG ERROR: Failed to call Brevo API: {str(e)}")
                return False

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
        # HTML is directly embedded here as it's cleaner for simple API usage
        html_content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #d9534f;">🔔 Nhắc nhở: Sắp tới hạn chót!</h2>
            <p>Xin chào <strong>{name}</strong>,</p>
            <p>Công việc "<strong>{task_title}</strong>" của môn <strong>{subject_name}</strong> sẽ hết hạn vào lúc <strong>{due_date}</strong>.</p>
            <p>Đừng quên hoàn thành nó nhé!</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{app_url}" style="background-color: #5cb85c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Mở ứng dụng ngay</a>
            </div>
            <p style="color: #718096; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
                Cố lên đồng chí ơi! 🔥
            </p>
        </div>
        """
        await self.send_email(
            email_to=email_to,
            subject=f"🔔 Reminder: Task Deadline Approaching - {task_title}",
            html_content=html_content,
            name_to=name
        )

    async def send_password_reset_email(
        self, 
        email_to: str, 
        name: str, 
        reset_link: str
    ):
        html_content = f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
            <div style="background-color: #4a5568; padding: 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Hệ thống Quản lý Học tập</h1>
            </div>
            <div style="padding: 32px;">
                <p>Kính chào <strong>{name}</strong>,</p>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại hệ thống Smart Study Planner.</p>
                <p>Để tiếp tục quá trình thay đổi mật khẩu, vui lòng nhấp vào nút xác nhận dưới đây:</p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="{reset_link}" style="display: inline-block; padding: 14px 28px; background-color: #3182ce; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Xác nhận đặt lại mật khẩu</a>
                </div>
                <p>Liên kết này sẽ có hiệu lực trong vòng <strong>60 phút</strong>.</p>
                <div style="color: #e53e3e; font-size: 14px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #edf2f7;">
                    <p><strong>Lưu ý:</strong> Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
                </div>
            </div>
            <div style="padding: 16px; text-align: center; font-size: 12px; color: #718096; background-color: #edf2f7; border-top: 1px solid #e2e8f0;">
                <p>Đây là email tự động từ hệ thống. Vui lòng không trả lời email này.</p>
                <p>&copy; 2024 Smart Study Planner Team.</p>
            </div>
        </div>
        """
        await self.send_email(
            email_to=email_to,
            subject="Yêu cầu đặt lại mật khẩu - Smart Study Planner",
            html_content=html_content,
            name_to=name
        )

email_service = EmailService()
