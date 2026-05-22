import pytest
from app.core.security import get_password_hash, verify_password

class TestPasswordHashing:
    """
    Các Test Case tiêu biểu: Kiểm tra thuật toán băm mật khẩu.
    Đảm bảo bcrypt hash hoạt động đúng.
    """

    def test_hash_is_not_plain_text(self):
        plain = "MySecretPassword123"
        hashed = get_password_hash(plain)
        assert hashed != plain

    def test_hash_starts_with_bcrypt_prefix(self):
        hashed = get_password_hash("test")
        assert hashed.startswith("$2b$")

    def test_verify_correct_password(self):
        plain = "CorrectPassword1"
        hashed = get_password_hash(plain)
        assert verify_password(plain, hashed) is True

    def test_verify_wrong_password(self):
        hashed = get_password_hash("CorrectPassword1")
        assert verify_password("WrongPassword1", hashed) is False

    def test_same_password_produces_different_hashes(self):
        plain = "SamePassword123"
        hash1 = get_password_hash(plain)
        hash2 = get_password_hash(plain)
        assert hash1 != hash2
        assert verify_password(plain, hash1) is True
        assert verify_password(plain, hash2) is True

    def test_password_stored_hashed_in_db(self, client, db_session):
        client.post(
            "/auth/register",
            json={
                "email": "hash_check@example.com",
                "password": "MyPlainPass1",
                "confirm_password": "MyPlainPass1",
                "name": "Hash Checker",
            },
        )
        from app.models.user import User

        user = db_session.query(User).filter_by(email="hash_check@example.com").first()
        assert user is not None
        assert user.password_hash != "MyPlainPass1"
        assert user.password_hash.startswith("$2b$")
        assert verify_password("MyPlainPass1", user.password_hash) is True
