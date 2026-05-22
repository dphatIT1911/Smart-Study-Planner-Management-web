import pytest
from app.models.user import User

def test_register_user_success(client, db_session):
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "confirm_password": "password123",
            "name": "Test User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    # Check database directly
    user = db_session.query(User).filter_by(email="test@example.com").first()
    assert user is not None
    assert user.name == "Test User"


def test_register_user_duplicate_email(client):
    user_data = {
        "email": "dup@example.com",
        "password": "password123",
        "confirm_password": "password123",
        "name": "Test User"
    }
    # Register first time
    client.post("/auth/register", json=user_data)
    
    # Register second time
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 409


def test_login_user_success(client):
    # Register user first
    user_data = {
        "email": "login@example.com",
        "password": "password123",
        "confirm_password": "password123",
        "name": "Test User"
    }
    client.post("/auth/register", json=user_data)
    
    # Login
    response = client.post(
        "/auth/login",
        json={"email": "login@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    tokens = response.json()
    assert "access_token" in tokens
    assert tokens["token_type"] == "bearer"


def test_login_user_wrong_password(client):
    # Register user first
    user_data = {
        "email": "wrong@example.com",
        "password": "password123",
        "confirm_password": "password123",
        "name": "Test User"
    }
    client.post("/auth/register", json=user_data)
    
    # Login with wrong password
    response = client.post(
        "/auth/login",
        json={"email": "wrong@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_read_user_profile_success(client):
    # Register and Login
    user_data = {
        "email": "profile@example.com",
        "password": "password123",
        "confirm_password": "password123",
        "name": "Test User Profile"
    }
    client.post("/auth/register", json=user_data)
    login_res = client.post(
        "/auth/login",
        json={"email": "profile@example.com", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    
    # Get Profile
    response = client.get(
        "/auth/profile",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    profile_data = response.json()
    assert profile_data["email"] == "profile@example.com"
    assert profile_data["name"] == "Test User Profile"


def test_logout(client):
    # Register and Login
    user_data = {
        "email": "logout@example.com",
        "password": "password123",
        "confirm_password": "password123",
        "name": "Test User Logout"
    }
    client.post("/auth/register", json=user_data)
    login_res = client.post(
        "/auth/login",
        json={"email": "logout@example.com", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    
    # Logout is purely a client-side token discard instruction in this basic setup
    response = client.post(
        "/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Successfully logged out. Please remove token from local storage."}
