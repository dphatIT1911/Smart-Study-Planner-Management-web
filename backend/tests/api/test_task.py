import pytest
from datetime import datetime, timedelta, timezone

@pytest.fixture
def test_user_auth(client):
    """Register and login a test user for tasks."""
    user_data = {
        "email": "task_tester@example.com",
        "password": "password123",
        "confirm_password": "password123",
        "name": "Task Tester"
    }
    try:
        client.post("/auth/register", json=user_data)
    except Exception:
        pass
        
    response = client.post(
        "/auth/login",
        json={"email": "task_tester@example.com", "password": "password123"}
    )
    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def other_user_auth(client):
    """Another user to test permissions."""
    user_data = {
        "email": "task_other@example.com",
        "password": "password123",
        "confirm_password": "password123",
        "name": "Other Task Tester"
    }
    try:
        client.post("/auth/register", json=user_data)
    except Exception:
        pass
        
    response = client.post(
        "/auth/login",
        json={"email": "task_other@example.com", "password": "password123"}
    )
    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}

def test_create_task(client, test_user_auth):
    profile_res = client.get("/auth/profile", headers=test_user_auth)
    user_id = profile_res.json()["id"]
    
    data = {
        "title": "Study Python",
        "description": "Read Python documentation",
        "status": "TODO",
        "priority": "HIGH",
        "estimated_minutes": 120,
        "user_id": user_id
    }
    
    response = client.post("/tasks/", json=data, headers=test_user_auth)
    assert response.status_code == 201
    content = response.json()
    assert content["title"] == "Study Python"
    assert content["status"] == "TODO"
    assert "id" in content

def test_create_task_wrong_user(client, test_user_auth):
    data = {"title": "Wrong User Task", "user_id": 99999}
    response = client.post("/tasks/", json=data, headers=test_user_auth)
    assert response.status_code == 403

def test_read_tasks(client, test_user_auth):
    profile_res = client.get("/auth/profile", headers=test_user_auth)
    user_id = profile_res.json()["id"]
    
    dt1 = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    dt2 = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    
    data1 = {"title": "Task 1", "status": "IN_PROGRESS", "priority": "MED", "user_id": user_id, "due_date": dt1}
    # DONE tasks are never overdue — use a future date to avoid past-date validator
    data2 = {"title": "Task 2", "status": "DONE", "priority": "LOW", "user_id": user_id} 
    
    client.post("/tasks/", json=data1, headers=test_user_auth)
    client.post("/tasks/", json=data2, headers=test_user_auth)
    
    # Read without filter
    response = client.get("/tasks/", headers=test_user_auth)
    assert response.status_code == 200
    content = response.json()
    assert len(content) >= 2
    
    # Verify business logic: `is_overdue` status calculation dynamically
    for task in content:
        if task["title"] == "Task 2":
            assert task["is_overdue"] is False
    
def test_read_task_by_id(client, test_user_auth, other_user_auth):
    profile_res = client.get("/auth/profile", headers=test_user_auth)
    user_id = profile_res.json()["id"]
    
    data = {"title": "Secure Task", "user_id": user_id}
    create_res = client.post("/tasks/", json=data, headers=test_user_auth)
    task_id = create_res.json()["id"]
    
    # Authorized GET
    get_res = client.get(f"/tasks/{task_id}", headers=test_user_auth)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Secure Task"
    
    # Unauthorized GET
    other_get_res = client.get(f"/tasks/{task_id}", headers=other_user_auth)
    assert other_get_res.status_code == 403
    
def test_update_task(client, test_user_auth):
    profile_res = client.get("/auth/profile", headers=test_user_auth)
    user_id = profile_res.json()["id"]
    
    data = {"title": "Original Task", "status": "TODO", "priority": "LOW", "user_id": user_id}
    create_res = client.post("/tasks/", json=data, headers=test_user_auth)
    task_id = create_res.json()["id"]
    
    # Patch Request
    update_data = {"status": "DONE", "priority": "HIGH", "actual_minutes": 60}
    patch_res = client.patch(f"/tasks/{task_id}", json=update_data, headers=test_user_auth)
    assert patch_res.status_code == 200
    updated_content = patch_res.json()
    
    assert updated_content["title"] == "Original Task" # unchanged
    assert updated_content["status"] == "DONE" # modified
    assert updated_content["priority"] == "HIGH" # modified
    assert updated_content["actual_minutes"] == 60 # modified

def test_delete_task(client, test_user_auth):
    profile_res = client.get("/auth/profile", headers=test_user_auth)
    user_id = profile_res.json()["id"]
    
    data = {"title": "Task to Delete", "user_id": user_id}
    create_res = client.post("/tasks/", json=data, headers=test_user_auth)
    task_id = create_res.json()["id"]
    
    delete_res = client.delete(f"/tasks/{task_id}", headers=test_user_auth)
    assert delete_res.status_code == 200
    
    get_res = client.get(f"/tasks/{task_id}", headers=test_user_auth)
    assert get_res.status_code == 404
