import json
import asyncio
from typing import List
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import openai
from google import genai
from google.genai import types
from datetime import datetime
import random

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.task import Task, TaskStatus
from app.models.subject import Subject
from app.schemas.chat import ChatRequest
from app.core.config import settings

router = APIRouter()


async def generate_with_gemini(messages: list, system_prompt: str):
    """Fallback: try Gemini keys in random order."""
    keys = [k for k in [settings.GEMINI_API_KEY, settings.GEMINI_API_KEY_2] if k]
    random.shuffle(keys)
    last_error = None

    gemini_contents = []
    for m in messages[-10:]:
        role = "user" if m.role == "user" else "model"
        gemini_contents.append(
            types.Content(role=role, parts=[types.Part(text=m.content)])
        )

    for api_key in keys:
        try:
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content_stream(
                model="gemini-2.0-flash",
                contents=gemini_contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.7,
                    max_output_tokens=800,
                ),
            )
            for chunk in response:
                if chunk.text:
                    yield f"data: {json.dumps({'content': chunk.text})}\n\n"
            yield "data: [DONE]\n\n"
            return  # success
        except Exception as e:
            last_error = str(e)
            print(f"Gemini key failed, trying next: {last_error}")
            continue

    # All Gemini keys failed
    error_msg = f"Trợ lý AI tạm thời không khả dụng. Lỗi: {last_error}"
    yield f"data: {json.dumps({'content': error_msg})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_chat_response(messages: list, user_context: str):
    """
    Try OpenAI first (primary). If fails, fall back to Gemini (rotation).
    """
    system_prompt = f"""Bạn là trợ lý học tập độc quyền của ứng dụng Smart Study Planner.
Bạn hãy tư vấn một cách ngắn gọn, súc tích, thân thiện và dùng tiếng Việt. 
Chỉ trả lời các câu hỏi liên quan đến học tập, sắp xếp thời gian biểu hoặc các công việc của người dùng.

Thông tin của người dùng hiện tại:
{user_context}

Dựa vào thông tin trên, hãy đưa ra lời khuyên phù hợp và cá nhân hóa. Nếu người dùng hỏi ngoài lề, hãy lịch sự từ chối và hướng họ quay lại việc học.
"""

    # --- 1. TRY OPENAI (PRIMARY) ---
    if settings.OPENAI_API_KEY:
        try:
            openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
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
                    yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"

            yield "data: [DONE]\n\n"
            return  # OpenAI success, done

        except Exception as e:
            print(f"OpenAI failed ({str(e)}), falling back to Gemini...")

    # --- 2. FALLBACK: GEMINI (ROTATE 2 KEYS) ---
    async for chunk in generate_with_gemini(messages, system_prompt):
        yield chunk


@router.post("")
async def chat_with_bot(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Endpoint chat bot có stream response dựa vào data của user."""
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS])
    ).order_by(Task.due_date.asc()).limit(10).all()

    subjects = db.query(Subject).filter(Subject.user_id == current_user.id).all()

    context_lines = [
        f"Tên người dùng: {current_user.name or current_user.email}",
        f"Ngày giờ hiện tại: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "--- Danh sách môn học ---"
    ]
    for sub in subjects:
        context_lines.append(f"- {sub.name}")

    context_lines.append("--- Danh sách công việc sắp tới ---")
    for t in tasks:
        due = t.due_date.strftime('%Y-%m-%d %H:%M') if t.due_date else "Không có hạn"
        context_lines.append(f"- {t.title} (Trạng thái: {t.status.value}, Hạn: {due})")

    user_context = "\n".join(context_lines)

    return StreamingResponse(
        generate_chat_response(request.messages, user_context),
        media_type="text/event-stream"
    )
