import pytest

@pytest.fixture
def auth_headers(client):
    """Register and login a test user, returning the Authorization headers."""
    user_data = {
        "email": "subject_tester@example.com",
        "password": "password123",
        "name": "Subject Tester"
    }
    # Register user (ignore error if already exists)
    try:
        client.post("/auth/register", json=user_data)
    except Exception:
        pass
    
    # Login
    response = client.post(
        "/auth/login",
        data={"username": "subject_tester@example.com", "password": "password123"}
    )
    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def other_auth_headers(client):
    """Register and login a completely different test user for 403 test cases."""
    user_data = {
        "email": "other_tester@example.com",
        "password": "password123",
        "name": "Other Tester"
    }
    try:
        client.post("/auth/register", json=user_data)
    except Exception:
        pass
        
    response = client.post(
        "/auth/login",
        data={"username": "other_tester@example.com", "password": "password123"}
    )
    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}

def test_create_subject(client, auth_headers):
    profile_res = client.get("/auth/profile", headers=auth_headers)
    user_id = profile_res.json()["id"]
    
    data = {
        "name": "Mathematics",
        "semester": "Fall 2026",
        "credits": 3,
        "target_score": 8.5,
        "color": "#FF0000",
        "user_id": user_id
    }
    
    response = client.post("/subjects/", json=data, headers=auth_headers)
    assert response.status_code == 201
    content = response.json()
    assert content["name"] == "Mathematics"
    assert "id" in content

def test_create_subject_wrong_user(client, auth_headers):
    data = {
        "name": "Physics",
        "semester": "Fall 2026",
        "credits": 4,
        "target_score": 9.0,
        "color": "#00FF00",
        "user_id": 99999 # Fake User ID should raise 403 Forbidden
    }
    response = client.post("/subjects/", json=data, headers=auth_headers)
    assert response.status_code == 403

def test_read_subjects(client, auth_headers):
    # Retrieve User ID first
    profile_res = client.get("/auth/profile", headers=auth_headers)
    user_id = profile_res.json()["id"]
    
    # Seed 2 Subjects
    data1 = {"name": "Math I", "semester": "Fall 2026", "credits": 3, "target_score": 8.5, "color": "#FF0000", "user_id": user_id}
    data2 = {"name": "Physics I", "semester": "Fall 2026", "credits": 4, "target_score": 9.0, "color": "#00FF00", "user_id": user_id}
    
    client.post("/subjects/", json=data1, headers=auth_headers)
    client.post("/subjects/", json=data2, headers=auth_headers)
    
    response = client.get("/subjects/", headers=auth_headers)
    assert response.status_code == 200
    content = response.json()
    
    # Asserting data integrity
    assert len(content) >= 2
    assert "name" in content[0]
    assert "id" in content[0]

def test_read_subject_by_id(client, auth_headers, other_auth_headers):
    profile_res = client.get("/auth/profile", headers=auth_headers)
    user_id = profile_res.json()["id"]
    
    data = {"name": "Chemistry", "semester": "Fall 2026", "credits": 3, "target_score": 8.5, "color": "#FF0000", "user_id": user_id}
    create_res = client.post("/subjects/", json=data, headers=auth_headers)
    subj_id = create_res.json()["id"]
    
    # Authorized User Call (200 OK)
    get_res = client.get(f"/subjects/{subj_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Chemistry"
    
    # Unauthorized User Call (403 Forbidden)
    other_get_res = client.get(f"/subjects/{subj_id}", headers=other_auth_headers)
    assert other_get_res.status_code == 403

def test_update_subject(client, auth_headers):
    profile_res = client.get("/auth/profile", headers=auth_headers)
    user_id = profile_res.json()["id"]
    
    # Create
    data = {"name": "Biology", "semester": "Fall 2026", "credits": 3, "target_score": 8.0, "color": "#0000FF", "user_id": user_id}
    create_res = client.post("/subjects/", json=data, headers=auth_headers)
    subj_id = create_res.json()["id"]
    
    # Patch updating target_score but omitting credits
    update_data = {"name": "Advanced Biology", "target_score": 9.5}
    patch_res = client.patch(f"/subjects/{subj_id}", json=update_data, headers=auth_headers)
    assert patch_res.status_code == 200
    
    updated_content = patch_res.json()
    assert updated_content["name"] == "Advanced Biology"
    assert updated_content["target_score"] == 9.5
    assert updated_content["credits"] == 3 # Should remain unmodified

def test_delete_subject(client, auth_headers):
    profile_res = client.get("/auth/profile", headers=auth_headers)
    user_id = profile_res.json()["id"]
    
    data = {"name": "Literature", "semester": "Fall 2026", "credits": 2, "target_score": 7.5, "color": "#FFFFFF", "user_id": user_id}
    create_res = client.post("/subjects/", json=data, headers=auth_headers)
    subj_id = create_res.json()["id"]
    
    # Delete API Call
    delete_res = client.delete(f"/subjects/{subj_id}", headers=auth_headers)
    assert delete_res.status_code == 200
    
    # Re-Verify Deletion
    get_res = client.get(f"/subjects/{subj_id}", headers=auth_headers)
    assert get_res.status_code == 404
