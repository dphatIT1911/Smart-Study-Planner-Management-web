import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import get_db
from app.models.base import Base

# Setup an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Create a new database session for a test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """
    Create a new TestClient that uses the `db_session` fixture
    to override the `get_db` dependency.
    """
    from httpx import Client, ASGITransport
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as c:
        yield c
        
    # Clean up
    app.dependency_overrides.clear()

# --- Common Fixtures ---

@pytest.fixture
def auth_headers(client):
    client.post(
        "/auth/register",
        json={"email": "tc_user@example.com", "password": "Secure123", "confirm_password": "Secure123", "name": "TC Tester"}
    )
    login = client.post(
        "/auth/login",
        json={"email": "tc_user@example.com", "password": "Secure123"}
    )
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def user_id(client, auth_headers):
    profile = client.get("/auth/profile", headers=auth_headers)
    return profile.json()["id"]

@pytest.fixture
def subject_id(client, auth_headers, user_id):
    data = {
        "name": "Toán Rời Rạc",
        "semester": "Fall 2026",
        "credits": 3,
        "target_score": 8.5,
        "color": "#667eea",
        "user_id": user_id,
    }
    res = client.post("/subjects/", json=data, headers=auth_headers)
    return res.json()["id"]
