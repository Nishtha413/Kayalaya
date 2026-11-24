from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.models.user import User


def test_register_success(client: TestClient, db_session: Session):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "beginner@kayalaya.app",
            "password": "securepassword123",
            "display_name": "Beginner Yogi",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "beginner@kayalaya.app"
    assert data["display_name"] == "Beginner Yogi"
    assert "id" in data
    assert "password" not in data

    # Verify password was hashed in the database
    user = db_session.query(User).filter(User.id == data["id"]).first()
    assert user is not None
    assert user.hashed_password != "securepassword123"
    assert verify_password("securepassword123", user.hashed_password)


def test_register_without_display_name(client: TestClient):
    response = client.post(
        "/api/auth/register",
        json={"email": "noname@kayalaya.app", "password": "securepassword123"},
    )
    assert response.status_code == 201
    assert response.json()["display_name"] is None


def test_register_duplicate_email(client: TestClient):
    payload = {"email": "duplicate@kayalaya.app", "password": "password123"}
    first = client.post("/api/auth/register", json=payload)
    assert first.status_code == 201

    second = client.post("/api/auth/register", json=payload)
    assert second.status_code == 400
    assert "already registered" in second.json()["detail"]


def test_register_invalid_email(client: TestClient):
    response = client.post(
        "/api/auth/register",
        json={"email": "not-a-valid-email", "password": "password123"},
    )
    assert response.status_code == 422


def test_login_success(client: TestClient):
    client.post(
        "/api/auth/register",
        json={"email": "login@kayalaya.app", "password": "mypassword"},
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "login@kayalaya.app", "password": "mypassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client: TestClient):
    client.post(
        "/api/auth/register",
        json={"email": "wrongpass@kayalaya.app", "password": "correctpassword"},
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "wrongpass@kayalaya.app", "password": "incorrectpassword"},
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_login_user_not_found(client: TestClient):
    response = client.post(
        "/api/auth/login",
        json={"email": "unknown@kayalaya.app", "password": "password"},
    )
    assert response.status_code == 401


def test_protected_route_without_token(client: TestClient):
    response = client.get("/api/poses")
    assert response.status_code == 401


def test_protected_route_with_invalid_token(client: TestClient):
    response = client.get(
        "/api/poses",
        headers={"Authorization": "Bearer invalid.jwt.token"},
    )
    assert response.status_code == 401


def test_protected_route_with_expired_token(client: TestClient, db_session: Session):
    reg = client.post(
        "/api/auth/register",
        json={"email": "expired@kayalaya.app", "password": "password123"},
    )
    user_id = reg.json()["id"]

    expired_token = create_access_token(data={"sub": str(user_id)}, expires_minutes=-10)
    response = client.get(
        "/api/poses",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert response.status_code == 401
