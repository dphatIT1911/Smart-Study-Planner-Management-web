import pytest
from datetime import datetime, timedelta, timezone

class TestTC02_TaskDueDatePast:
    """
    TC-02: Tạo Task mới nhưng chọn Due Date là một ngày trong quá khứ
    → Hệ thống từ chối lưu, cảnh báo "Thời hạn không hợp lệ".
    """

    def test_create_task_past_due_date(self, client, auth_headers, user_id):
        past_date = (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
        data = {
            "title": "Bài tập quá khứ",
            "user_id": user_id,
            "due_date": past_date,
        }
        response = client.post("/tasks/", json=data, headers=auth_headers)
        assert response.status_code == 422
        errors = response.json()["detail"]
        due_errors = [e for e in errors if "due_date" in str(e.get("loc", []))]
        assert len(due_errors) > 0

    def test_create_task_past_due_date_by_1_hour(self, client, auth_headers, user_id):
        past_hour = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        data = {
            "title": "Hơi muộn rồi",
            "user_id": user_id,
            "due_date": past_hour,
        }
        response = client.post("/tasks/", json=data, headers=auth_headers)
        assert response.status_code == 422

    def test_create_task_future_due_date(self, client, auth_headers, user_id):
        future = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
        data = {
            "title": "Bài tập tương lai",
            "user_id": user_id,
            "due_date": future,
        }
        response = client.post("/tasks/", json=data, headers=auth_headers)
        assert response.status_code == 201
        assert response.json()["title"] == "Bài tập tương lai"

    def test_create_task_no_due_date(self, client, auth_headers, user_id):
        data = {
            "title": "Không giới hạn thời gian",
            "user_id": user_id,
        }
        response = client.post("/tasks/", json=data, headers=auth_headers)
        assert response.status_code == 201


class TestTC03_TaskWithoutSubject:
    """
    TC-03: Tạo Task nhưng không chọn thuộc về Môn học nào
    → Cho phép subject_id = None (tự động gán mục "General").
    """

    def test_create_task_without_subject(self, client, auth_headers, user_id):
        data = {
            "title": "Công việc cá nhân",
            "user_id": user_id,
        }
        response = client.post("/tasks/", json=data, headers=auth_headers)
        assert response.status_code == 201
        content = response.json()
        assert content["subject_id"] is None

    def test_create_task_with_subject(self, client, auth_headers, user_id, subject_id):
        future = (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()
        data = {
            "title": "Ôn thi Toán Rời Rạc",
            "user_id": user_id,
            "subject_id": subject_id,
            "due_date": future,
        }
        response = client.post("/tasks/", json=data, headers=auth_headers)
        assert response.status_code == 201
        assert response.json()["subject_id"] == subject_id


class TestTC05_TaskStatusChange:
    """
    TC-05: Đổi trạng thái Task từ "To-do" sang "Done" trên bảng chi tiết
    → Lịch học lập tức cập nhật trạng thái của Task đó.
    """

    def test_update_status_todo_to_done(self, client, auth_headers, user_id):
        future = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
        create_res = client.post(
            "/tasks/",
            json={
                "title": "Task chờ hoàn thành",
                "user_id": user_id,
                "status": "TODO",
                "due_date": future,
            },
            headers=auth_headers,
        )
        assert create_res.status_code == 201
        task_id = create_res.json()["id"]
        assert create_res.json()["status"] == "TODO"

        patch_res = client.patch(
            f"/tasks/{task_id}",
            json={"status": "DONE"},
            headers=auth_headers,
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["status"] == "DONE"

        get_res = client.get(f"/tasks/{task_id}", headers=auth_headers)
        assert get_res.status_code == 200
        assert get_res.json()["status"] == "DONE"

    def test_update_status_todo_to_in_progress(self, client, auth_headers, user_id):
        create_res = client.post(
            "/tasks/",
            json={"title": "Task đang làm", "user_id": user_id, "status": "TODO"},
            headers=auth_headers,
        )
        task_id = create_res.json()["id"]

        patch_res = client.patch(
            f"/tasks/{task_id}",
            json={"status": "IN_PROGRESS"},
            headers=auth_headers,
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["status"] == "IN_PROGRESS"

    def test_done_task_is_not_overdue(self, client, auth_headers, user_id):
        future = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        create_res = client.post(
            "/tasks/",
            json={
                "title": "Xong trước hạn",
                "user_id": user_id,
                "status": "TODO",
                "due_date": future,
            },
            headers=auth_headers,
        )
        task_id = create_res.json()["id"]

        client.patch(
            f"/tasks/{task_id}",
            json={"status": "DONE"},
            headers=auth_headers,
        )

        get_res = client.get(f"/tasks/{task_id}", headers=auth_headers)
        data = get_res.json()
        assert data["status"] == "DONE"
        assert data["is_overdue"] is False


class TestTaskValidation:
    """Kiểm tra các ràng buộc dữ liệu của Task: title 3-100 ký tự, description < 5000."""

    def test_create_task_title_too_short(self, client, auth_headers, user_id):
        data = {"title": "AB", "user_id": user_id}
        response = client.post("/tasks/", json=data, headers=auth_headers)
        assert response.status_code == 422

    def test_create_task_title_too_long(self, client, auth_headers, user_id):
        data = {"title": "X" * 101, "user_id": user_id}
        response = client.post("/tasks/", json=data, headers=auth_headers)
        assert response.status_code == 422

    def test_create_task_title_boundary_3_chars(self, client, auth_headers, user_id):
        data = {"title": "ABC", "user_id": user_id}
        response = client.post("/tasks/", json=data, headers=auth_headers)
        assert response.status_code == 201

    def test_create_task_title_boundary_100_chars(self, client, auth_headers, user_id):
        data = {"title": "T" * 100, "user_id": user_id}
        response = client.post("/tasks/", json=data, headers=auth_headers)
        assert response.status_code == 201

    def test_create_task_missing_title(self, client, auth_headers, user_id):
        data = {"user_id": user_id, "description": "No title provided"}
        response = client.post("/tasks/", json=data, headers=auth_headers)
        assert response.status_code == 422
