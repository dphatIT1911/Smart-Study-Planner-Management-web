import pytest
from datetime import datetime, timedelta, timezone
from app.models.task import Task
from app.models.study_session import StudySession

@pytest.fixture
def auth_headers(client):
    user_data = {
        "email": "session_tester@example.com",
        "password": "password123",
        "confirm_password": "password123",
        "name": "Session Tester"
    }
    try:
        client.post("/auth/register", json=user_data)
    except Exception:
        pass
    response = client.post(
        "/auth/login",
        json={"email": "session_tester@example.com", "password": "password123"}
    )
    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}

def test_create_study_session(client, db_session, auth_headers):
    profile_res = client.get("/auth/profile", headers=auth_headers)
    user_id = profile_res.json()["id"]

    # 1. Provide a dummy subject & task for test_user
    from app.models.subject import Subject
    subject = Subject(name="Toán Rời Rạc", semester="Fall 2026", credits=3, target_score=8.5, color="#FF0", user_id=user_id)
    db_session.add(subject)
    db_session.commit()
    db_session.refresh(subject)
    
    task = Task(title="Làm đề cương", subject_id=subject.id, user_id=user_id, estimated_minutes=120)
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)

    # 2. Assert initial actual_minutes
    assert task.actual_minutes == 0

    # 3. Create StudySession payload
    payload = {
        "task_id": task.id,
        "start_time": (datetime.now(timezone.utc) - timedelta(minutes=25)).isoformat(),
        "end_time": datetime.now(timezone.utc).isoformat(),
        "duration_minutes": 25
    }

    # 4. Fire Request
    response = client.post(
        "/sessions/",
        headers=auth_headers,
        json=payload
    )

    # 5. Assert Response
    assert response.status_code == 200
    data = response.json()
    assert data["task_id"] == task.id
    assert data["duration_minutes"] == 25

    # 6. Verify accumulation functionality
    db_session.refresh(task)
    assert task.actual_minutes == 25

def test_create_study_session_exceed_limit(client, auth_headers):
    payload = {
        "task_id": 999,
        "start_time": (datetime.now(timezone.utc) - timedelta(minutes=250)).isoformat(),
        "end_time": datetime.now(timezone.utc).isoformat(),
        "duration_minutes": 250
    }
    response = client.post(
        "/sessions/",
        headers=auth_headers,
        json=payload
    )
    assert response.status_code == 400
    assert "cannot exceed 240" in response.json()["detail"]

def test_unauthorized_task_session(client, auth_headers):
    # Payload valid but task does not belong to user (or doesn't exist)
    payload = {
        "task_id": 9999, 
        "start_time": (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat(),
        "end_time": datetime.now(timezone.utc).isoformat(),
        "duration_minutes": 30
    }
    response = client.post(
        "/sessions/",
        headers=auth_headers,
        json=payload
    )
    assert response.status_code == 404
    assert "Task not found" in response.json()["detail"]
