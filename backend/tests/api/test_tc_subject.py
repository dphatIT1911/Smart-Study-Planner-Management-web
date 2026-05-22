import pytest
from datetime import datetime, timedelta, timezone

class TestDatabaseConstraints:
    """
    Các Test Case tiêu biểu: kiểm tra các ràng buộc cơ sở dữ liệu.
    VD: Khi xóa môn học còn task active → task được chuyển sang "Chung" (subject_id = None).
    """

    def test_delete_active_subject_reassigns_tasks(
        self, client, auth_headers, user_id
    ):
        sub_res = client.post(
            "/subjects/",
            json={
                "name": "Giải Tích 2",
                "semester": "Fall 2026",
                "credits": 4,
                "target_score": 7.0,
                "color": "#e53e3e",
                "user_id": user_id,
            },
            headers=auth_headers,
        )
        sub_id = sub_res.json()["id"]

        future = (datetime.now(timezone.utc) + timedelta(days=10)).isoformat()
        task_res = client.post(
            "/tasks/",
            json={
                "title": "Làm bài tập Giải Tích",
                "user_id": user_id,
                "subject_id": sub_id,
                "due_date": future,
            },
            headers=auth_headers,
        )
        task_id = task_res.json()["id"]
        assert task_res.json()["subject_id"] == sub_id

        del_res = client.delete(f"/subjects/{sub_id}", headers=auth_headers)
        assert del_res.status_code == 200

        task_check = client.get(f"/tasks/{task_id}", headers=auth_headers)
        assert task_check.status_code == 200
        assert task_check.json()["subject_id"] is None

    def test_delete_subject_returns_404_after_deletion(
        self, client, auth_headers, user_id
    ):
        sub_res = client.post(
            "/subjects/",
            json={
                "name": "Vật lý Đại cương",
                "semester": "Fall 2026",
                "credits": 3,
                "target_score": 8.0,
                "color": "#38a169",
                "user_id": user_id,
            },
            headers=auth_headers,
        )
        sub_id = sub_res.json()["id"]

        client.delete(f"/subjects/{sub_id}", headers=auth_headers)
        get_res = client.get(f"/subjects/{sub_id}", headers=auth_headers)
        assert get_res.status_code == 404

    def test_duplicate_email_rejected(self, client):
        user = {
            "email": "unique_only@example.com",
            "password": "Password123",
            "confirm_password": "Password123",
            "name": "First User",
        }
        r1 = client.post("/auth/register", json=user)
        assert r1.status_code == 201

        r2 = client.post("/auth/register", json=user)
        assert r2.status_code == 409  # Conflict
