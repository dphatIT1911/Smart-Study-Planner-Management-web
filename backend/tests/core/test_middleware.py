import pytest

def test_public_routes_no_auth(client):
    # Health endpoint
    response = client.get("/health")
    # Health requires no DB typically, but depends on setup. It should be public.
    assert response.status_code == 200

    # Root endpoint
    response = client.get("/")
    assert response.status_code == 200

    # OpenAPI docs
    response = client.get("/openapi.json")
    assert response.status_code == 200


def test_protected_route_missing_token(client):
    # Profiler endpoint requires auth check
    response = client.get("/auth/profile")
    assert response.status_code == 401
    assert response.json() == {"detail": "Missing or invalid authorization token"}


def test_protected_route_invalid_token(client):
    response = client.get(
        "/auth/profile",
        headers={"Authorization": "Bearer invalid_token_xyz"}
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Could not validate credentials"}


def test_protected_route_wrong_auth_header_format(client):
    # No Bearer prefix
    response = client.get(
        "/auth/profile",
        headers={"Authorization": "Token my_token_here"} # Wrong prefix
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Missing or invalid authorization token"}
