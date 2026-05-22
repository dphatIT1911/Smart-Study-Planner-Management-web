import pytest

class TestTC01_Authentication:
    """
    TC-01: Nhập email sai định dạng (vd: `student@.com`) hoặc mật khẩu
    dưới 8 ký tự → Hệ thống chặn, hiển thị thông báo lỗi cụ thể.
    """

    def test_register_invalid_email_format(self, client):
        response = client.post(
            "/auth/register",
            json={
                "email": "student@.com",
                "password": "ValidPass1",
                "confirm_password": "ValidPass1",
                "name": "Bad Email",
            },
        )
        assert response.status_code == 422
        errors = response.json()["detail"]
        email_errors = [e for e in errors if "email" in str(e.get("loc", []))]
        assert len(email_errors) > 0

    def test_register_invalid_email_no_at(self, client):
        response = client.post(
            "/auth/register",
            json={
                "email": "studentexample.com",
                "password": "ValidPass1",
                "confirm_password": "ValidPass1",
                "name": "No At Sign",
            },
        )
        assert response.status_code == 422

    def test_register_invalid_email_no_domain(self, client):
        response = client.post(
            "/auth/register",
            json={
                "email": "student@",
                "password": "ValidPass1",
                "confirm_password": "ValidPass1",
                "name": "No Domain",
            },
        )
        assert response.status_code == 422

    def test_register_password_too_short(self, client):
        response = client.post(
            "/auth/register",
            json={
                "email": "short_pw@example.com",
                "password": "Ab1",
                "confirm_password": "Ab1",
                "name": "Short Password",
            },
        )
        assert response.status_code == 422
        errors = response.json()["detail"]
        pw_errors = [e for e in errors if "password" in str(e.get("loc", []))]
        assert len(pw_errors) > 0

    def test_register_password_exactly_7_chars(self, client):
        response = client.post(
            "/auth/register",
            json={
                "email": "seven@example.com",
                "password": "1234567",
                "confirm_password": "1234567",
                "name": "Seven Chars",
            },
        )
        assert response.status_code == 422

    def test_register_password_exactly_8_chars(self, client):
        response = client.post(
            "/auth/register",
            json={
                "email": "eight_ok@example.com",
                "password": "12345678",
                "confirm_password": "12345678",
                "name": "Eight Chars",
            },
        )
        assert response.status_code == 201

    def test_register_name_too_short(self, client):
        response = client.post(
            "/auth/register",
            json={
                "email": "nameshort@example.com",
                "password": "ValidPass1",
                "confirm_password": "ValidPass1",
                "name": "AB",
            },
        )
        assert response.status_code == 422

    def test_register_password_mismatch(self, client):
        response = client.post(
            "/auth/register",
            json={
                "email": "mismatch@example.com",
                "password": "ValidPass1",
                "confirm_password": "WrongPass1",
                "name": "Mismatch User",
            },
        )
        assert response.status_code == 400
        assert "không khớp" in response.json()["detail"]


class TestLoginValidation:
    """Kiểm tra validate định dạng email/password khi login."""

    def test_login_wrong_email(self, client):
        response = client.post(
            "/auth/login",
            json={"email": "nobody@example.com", "password": "SomePass1"},
        )
        assert response.status_code == 401

    def test_login_wrong_password(self, client):
        client.post(
            "/auth/register",
            json={
                "email": "login_test@example.com",
                "password": "CorrectPw1",
                "confirm_password": "CorrectPw1",
                "name": "Login Test",
            },
        )
        response = client.post(
            "/auth/login",
            json={"email": "login_test@example.com", "password": "WrongPw123"},
        )
        assert response.status_code == 401

    def test_login_case_insensitive_email(self, client):
        client.post(
            "/auth/register",
            json={
                "email": "CaseTest@Example.com",
                "password": "ValidPass1",
                "confirm_password": "ValidPass1",
                "name": "Case Test",
            },
        )
        response = client.post(
            "/auth/login",
            json={"email": "casetest@example.com", "password": "ValidPass1"},
        )
        assert response.status_code == 200
        assert "access_token" in response.json()


class TestUnauthenticatedAccess:
    """API route bảo mật phải từ chối request không có Bearer token."""

    def test_tasks_without_auth(self, client):
        response = client.get("/tasks/")
        assert response.status_code in (401, 403)

    def test_subjects_without_auth(self, client):
        response = client.get("/subjects/")
        assert response.status_code in (401, 403)

    def test_profile_without_auth(self, client):
        response = client.get("/auth/profile")
        assert response.status_code in (401, 403)
