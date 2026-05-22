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
    # Profile endpoint requires auth - OAuth2PasswordBearer returns 401 "Not authenticated"
    response = client.get("/auth/profile")
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_protected_route_invalid_token(client):
    response = client.get(
        "/auth/profile",
        headers={"Authorization": "Bearer invalid_token_xyz"}
    )
    # deps.get_current_user raises 401 when JWT decode fails
    assert response.status_code == 401
    assert response.json() == {"detail": "Could not validate credentials"}


def test_protected_route_wrong_auth_header_format(client):
    # No Bearer prefix - OAuth2PasswordBearer sees no valid Bearer token
    response = client.get(
        "/auth/profile",
        headers={"Authorization": "Token my_token_here"} # Wrong prefix
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}

