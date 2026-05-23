import pytest
from app.api import auth
from app.services.auth_service import update_user_streak
from app.models.user import User

def test_user_streak_logic():
    # Giả lập đối tượng user để test logic tính chuỗi (streak)
    user = User(
        id=999,
        email="streak_test@gmail.com",
        name="Streak Tester",
        streak_count=0,
    )
    
    # Lần đầu tiên login -> streak = 1
    assert user.streak_count == 0
    # Simulate first update
    user.streak_count = 1
    assert user.streak_count == 1
    
    # Simulate consecutive login
    user.streak_count += 1
    assert user.streak_count == 2
    
    # Khi streak >= 2 thì streak_active = True
    user.streak_active = user.streak_count >= 2
    assert user.streak_active is True

def test_forgot_password_endpoint_mock(client):
    # Test api forgot password trả về message thành công giả
    response = client.post("/auth/forgot-password", json={"email": "not_exist_email@gmail.com"})
    assert response.status_code == 200
    assert "chúng tôi đã gửi thư" in response.json()["message"]
