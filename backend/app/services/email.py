import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

async def send_password_reset_email(email: str, token: str):
    if not settings.GAS_EMAIL_API_URL:
        logger.error("GAS_EMAIL_API_URL is not set in environment variables.")
        return False
        
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Khôi phục mật khẩu</h2>
        <p>Xin chào,</p>
        <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản liên kết với địa chỉ email <strong>{email}</strong> trên hệ thống Smart Study Planner.</p>
        <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu của bạn:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Đặt lại mật khẩu</a>
        </div>
        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            Liên kết này sẽ hết hạn trong vòng 15 phút.<br>
            Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">Đây là email tự động, vui lòng không trả lời.</p>
    </div>
    """
    
    payload = {
        "to": email,
        "subject": "[Smart Study Planner] Khôi phục mật khẩu",
        "body": html_body
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(settings.GAS_EMAIL_API_URL, json=payload, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    logger.info(f"Successfully sent reset email to {email} via GAS.")
                    return True
                else:
                    logger.error(f"GAS API Error: {data.get('message')}")
                    return False
            else:
                logger.error(f"Failed to call GAS API. Status: {response.status_code}, Body: {response.text}")
                return False
    except Exception as e:
        logger.error(f"Exception calling GAS API: {str(e)}")
        return False

async def send_deadline_email(email: str, user_name: str, task_title: str, due_date: str, subject_name: str):
    if not settings.GAS_EMAIL_API_URL:
        logger.error("GAS_EMAIL_API_URL is not set in environment variables.")
        return False
        
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #ef4444; text-align: center;">⏰ Báo động đỏ: Trễ Deadline rồi kìa!</h2>
        <p>Chào <strong>{user_name}</strong>,</p>
        <p>Đây là thông báo khẩn cấp từ hệ thống Smart Study Planner. Bạn có một công việc sắp đến hạn chót (Deadline) trong chưa đầy 24 giờ tới!</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #ef4444; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>📚 Môn học:</strong> {subject_name}</p>
            <p style="margin: 0 0 10px 0;"><strong>📝 Nhiệm vụ:</strong> {task_title}</p>
            <p style="margin: 0;"><strong>⏱ Hạn chót:</strong> <span style="color: #ef4444; font-weight: bold;">{due_date}</span></p>
        </div>
        
        <p style="text-align: center; font-style: italic; color: #64748b; font-size: 16px; margin: 30px 0;">
            "Đừng để nước đến chân mới nhảy nhé! Cố gắng hoàn thành sớm để có thời gian nghỉ ngơi nha." 🚀
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{settings.FRONTEND_URL}/tasks" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Mở danh sách Công việc ngay</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">Đây là email tự động từ hệ thống Smart Study Planner.</p>
    </div>
    """
    
    payload = {
        "to": email,
        "subject": f"[Smart Study Planner] Nhắc nhở Deadline: {task_title}",
        "body": html_body
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(settings.GAS_EMAIL_API_URL, json=payload, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    logger.info(f"Successfully sent deadline email to {email}.")
                    return True
                else:
                    logger.error(f"GAS API Error: {data.get('message')}")
                    return False
            else:
                logger.error(f"Failed to send deadline email. Status: {response.status_code}, Body: {response.text}")
                return False
    except Exception as e:
        logger.error(f"Exception calling GAS API for deadline: {str(e)}")
        return False
