import pytest
from datetime import datetime, timedelta, timezone
from app.models.task import Task

class TestTC04_PomodoroAccumulation:
    """
    TC-04: Chạy bộ đếm 25 phút đến khi kết thúc (00:00).
    Sau khi xác nhận, thời gian học thực tế (actual_minutes) của Task
    được cộng thêm 25.
    """

    def test_pomodoro_session_adds_25_minutes(
        self, client, db_session, auth_headers, user_id, subject_id
    ):
        task = Task(
            title="Học chương 5",
            subject_id=subject_id,
            user_id=user_id,
            estimated_minutes=120,
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)
        assert task.actual_minutes == 0

        now = datetime.now(timezone.utc)
        payload = {
            "task_id": task.id,
            "start_time": (now - timedelta(minutes=25)).isoformat(),
            "end_time": now.isoformat(),
            "duration_minutes": 25,
        }
        response = client.post("/sessions/", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["duration_minutes"] == 25

        db_session.refresh(task)
        assert task.actual_minutes == 25

    def test_multiple_pomodoro_sessions_accumulate(
        self, client, db_session, auth_headers, user_id, subject_id
    ):
        task = Task(
            title="Ôn tập cuối kỳ",
            subject_id=subject_id,
            user_id=user_id,
            estimated_minutes=200,
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        for i in range(3):
            now = datetime.now(timezone.utc)
            client.post(
                "/sessions/",
                json={
                    "task_id": task.id,
                    "start_time": (now - timedelta(minutes=25)).isoformat(),
                    "end_time": now.isoformat(),
                    "duration_minutes": 25,
                },
                headers=auth_headers,
            )

        db_session.refresh(task)
        assert task.actual_minutes == 75

    def test_session_exceeds_240_minutes_rejected(self, client, auth_headers):
        payload = {
            "task_id": 9999,
            "start_time": (datetime.now(timezone.utc) - timedelta(minutes=300)).isoformat(),
            "end_time": datetime.now(timezone.utc).isoformat(),
            "duration_minutes": 300,
        }
        response = client.post("/sessions/", json=payload, headers=auth_headers)
        assert response.status_code == 400
        assert "cannot exceed 240" in response.json()["detail"]
