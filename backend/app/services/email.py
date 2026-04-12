import httpx
import os
from typing import Optional
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY")
        self.base_url = "https://api.resend.com/emails"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        print(f"DEBUG: EmailService initialized using {'Resend API' if self.api_key else 'SMTP (Fallback/Missing Key)'}")

    async def send_email(
        self, 
        email_to: str, 
        subject: str, 
        html_content: str
    ):
        if not self.api_key:
            print("DEBUG ERROR: RESEND_API_KEY is missing. Cannot send email.")
            return False

        async with httpx.AsyncClient() as client:
            try:
                payload = {
                    "from": f"{settings.EMAILS_FROM_NAME} <onboarding@resend.dev>", 
                    "to": [email_to],
                    "subject": subject,
                    "html": html_content
                }
                
                # Note: If you have a custom domain verified in Resend, 
                # change 'onboarding@resend.dev' to your verified email.
                if settings.EMAILS_FROM_EMAIL and "@" in settings.EMAILS_FROM_EMAIL:
                     # Only use custom from if not onboarding or if verified
                     pass

                response = await client.post(self.base_url, json=payload, headers=self.headers)
                
                if response.status_code == 201:
                    print(f"DEBUG: Email sent via Resend to {email_to}")
                    return True
                else:
                    print(f"DEBUG ERROR: Resend API failed: {response.text}")
                    return False
            except Exception as e:
                print(f"DEBUG ERROR: Failed to call Resend API: {str(e)}")
                return False

    async def send_deadline_reminder(self, email_to: str, name: str, task_title: str, due_date: str, subject_name: str = "General", description: str = "", app_url: str = "https://smart-study-planner.web.app"):
        html_content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #d9534f;">🔔 Nhắc nhở: Sắp tới hạn chót!</h2>
            <p>Xin chào <strong>{name}</strong>,</p>
            <p>Công việc "<strong>{task_title}</strong>" của môn {subject_name} sẽ hết hạn vào lúc <strong>{due_date}</strong>.</p>
            <p>Đừng quên hoàn thành nó nhé!</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{app_url}" style="background-color: #5cb85c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Mở ứng dụng ngay</a>
            </div>
        </div>
        """
        await self.send_email(
            email_to=email_to,
            subject=f"🔔 Reminder: Task Deadline Approaching - {task_title}",
            html_content=html_content
        )

    async def send_password_reset_email(self, email_to: str, name: str, reset_link: str):
        # We'll use a simple HTML template string since we're moving away from Jinja templates for now 
        # to ensure the quickest fix. We can re-integrate Jinja later if needed.
        html_content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333;">Yêu cầu đặt lại mật khẩu</h2>
            <p>Kính chào <strong>{name}</strong>,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại hệ thống Smart Study Planner.</p>
            <p>Vui lòng nhấp vào nút bên dưới để thực hiện thay đổi mật khẩu (Liên kết có hiệu lực trong 60 phút):</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Xác nhận đặt lại mật khẩu</a>
            </div>
            <p style="color: #718096; font-size: 12px; border-top: 1px solid #eee; pt: 20px;">
                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
            </p>
        </div>
        """
        await self.send_email(
            email_to=email_to,
            subject="🔑 Reset your password - Smart Study Planner",
            html_content=html_content
        )

email_service = EmailService()
