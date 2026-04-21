import json
import asyncio
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import openai
import google.generativeai as genai
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.task import Task, TaskStatus
from app.models.subject import Subject
from app.schemas.chat import ChatRequest
from app.core.config import settings

router = APIRouter()

# Tự động gán API Key, bạn có thể chỉnh sửa trực tiếp .env hoặc file config.py
openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("AIzaSy-..."):
    genai.configure(api_key=settings.GEMINI_API_KEY)

async def generate_with_gemini(messages: list, system_prompt: str):
    """Fallback generator for Gemini API."""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_prompt)
        
        # Convert messages to Gemini format (user vs model)
        gemini_history = []
        for m in messages[:-1]: # exclude last message
            role = "user" if m.role == "user" else "model"
            gemini_history.append({"role": role, "parts": [m.content]})
            
        chat = model.start_chat(history=gemini_history)
        last_msg = messages[-1].content
        
        response = await chat.send_message_async(last_msg, stream=True)
        
        async for chunk in response:
            if chunk.text:
                yield f"data: {json.dumps({'content': chunk.text})}\n\n"
        
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        yield "data: [ERROR]\n\n"
        error_msg = f"Lỗi! Cả hệ thống OpenAI và Gemini dự phòng đều đang gặp sự cố: {str(e)}"
        yield f"data: {json.dumps({'content': error_msg})}\n\n"


async def generate_chat_response(messages: list, user_context: str):
    """
    Hàm generator cố gắng gọi OpenAI trước, nếu thất bại (hết tiền, lỗi) sẽ gọi sang Gemini.
    """
    system_prompt = f"""Bạn là trợ lý học tập độc quyền của ứng dụng Smart Study Planner.
Bạn hãy tư vấn một cách ngắn gọn, súc tích, thân thiện và dùng tiếng Việt. 
Chỉ trả lời các câu hỏi liên quan đến học tập, sắp xếp thời gian biểu hoặc các công việc của người dùng.

Thông tin của người dùng hiện tại:
{user_context}

Dựa vào thông tin trên, hãy đưa ra lời khuyên phù hợp và cá nhân hóa. Nếu người dùng hỏi ngoài lề, hãy lịch sự từ chối và hướng họ quay lại việc học.
"""

    # 1. Thử gọi OPENAI
    if settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("sk-proj-..."):
        try:
            api_messages = [{"role": "system", "content": system_prompt}]
            for m in messages[-10:]:
                role = m.role if m.role in ["user", "assistant"] else "user"
                api_messages.append({"role": role, "content": m.content})

            response = await openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=api_messages,
                stream=True,
                temperature=0.7,
                max_tokens=800,
            )

            async for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    yield f"data: {json.dumps({'content': content})}\n\n"
                
            yield "data: [DONE]\n\n"
            return # Thoát luôn nếu OpenAI thành công
                
        except Exception as e:
            print(f"OpenAI API Error: {str(e)}. Đang chuyển sang Gemini...")
            # Bỏ qua lỗi và rớt xuống logic của Gemini bên dưới
    
    # 2. Dự phòng: Gọi GEMINI nếu OpenAI lỗi hoặc chưa có Key
    if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("AIzaSy-..."):
        async for chunk in generate_with_gemini(messages, system_prompt):
             yield chunk
    else:
        yield "data: [ERROR]\n\n"
        error_msg = "Vui lòng kiểm tra lại API Key thật của OpenAI hoặc Gemini trên Render Environment."
        yield f"data: {json.dumps({'content': error_msg})}\n\n"


@router.post("")
async def chat_with_bot(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint chat bot có stream response dựa vào data của user
    """
    # Lấy dữ liệu công việc hiện tại của user để làm context
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS])
    ).order_by(Task.due_date.asc()).limit(10).all()
    
    subjects = db.query(Subject).filter(Subject.user_id == current_user.id).all()
    
    # Xây dựng chuỗi thông tin context
    context_lines = [
        f"Tên người dùng: {current_user.full_name or current_user.email}",
        f"Ngày giờ hiện tại: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "--- Danh sách môn học ---"
    ]
    
    for sub in subjects:
        context_lines.append(f"- {sub.name} (Chỉ tiêu: {sub.target_grade}, Hiện tại: {sub.current_grade})")
        
    context_lines.append("--- Danh sách công việc sắp tới ---")
    for t in tasks:
        due = t.due_date.strftime('%Y-%m-%d %H:%M') if t.due_date else "Không có hạn"
        context_lines.append(f"- {t.title} (Trạng thái: {t.status.value}, Hạn: {due})")
        
    user_context = "\n".join(context_lines)

    # Trả về StreamingResponse dưới dạng Media type text/event-stream
    return StreamingResponse(
        generate_chat_response(request.messages, user_context), 
        media_type="text/event-stream"
    )
