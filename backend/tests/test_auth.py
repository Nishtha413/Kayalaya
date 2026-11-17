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


def test_register_password_too_short(client: TestClient):
    response = client.post(
        "/api/auth/register",
        json={"email": "shortpass@kayalaya.app", "password": "12345"},
    )
    assert response.status_code == 422


def test_token_form_login_success(client: TestClient):
    client.post(
        "/api/auth/register",
        json={"email": "swagger@kayalaya.app", "password": "swaggerpassword123"},
    )
    # Form data request matching OAuth2 standard
    response = client.post(
        "/api/auth/token",
        data={"username": "swagger@kayalaya.app", "password": "swaggerpassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_token_form_login_failure(client: TestClient):
    response = client.post(
        "/api/auth/token",
        data={"username": "nonexistent@kayalaya.app", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_get_current_user_me(client: TestClient):
    reg = client.post(
        "/api/auth/register",
        json={
            "email": "me@kayalaya.app",
            "password": "mepassword123",
            "display_name": "Me Yogi",
        },
    )
    token = client.post(
        "/api/auth/login",
        json={"email": "me@kayalaya.app", "password": "mepassword123"},
    ).json()["access_token"]

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@kayalaya.app"
    assert data["display_name"] == "Me Yogi"
    assert data["id"] == reg.json()["id"]


def test_delete_account_and_cascade_data(client: TestClient, seeded_db: Session):
    reg = client.post(
        "/api/auth/register",
        json={"email": "delete_me@kayalaya.app", "password": "password123"},
    )
    user_id = reg.json()["id"]
    token = client.post(
        "/api/auth/login",
        json={"email": "delete_me@kayalaya.app", "password": "password123"},
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Record a practice attempt for this user
    client.post(
        "/api/progress/practice-attempt",
        headers=headers,
        json={"pose_id": "mountain", "day_number": 1, "accuracy_score": 85.0},
    )

    # Delete account
    del_res = client.delete("/api/auth/me", headers=headers)
    assert del_res.status_code == 200

    # User no longer exists
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 401

    # Cannot login with deleted credentials
    login_res = client.post(
        "/api/auth/login",
        json={"email": "delete_me@kayalaya.app", "password": "password123"},
    )
    assert login_res.status_code == 401


def test_update_user_survey(client: TestClient):
    client.post(
        "/api/auth/register",
        json={"email": "survey@kayalaya.app", "password": "password123"},
    )
    login_res = client.post(
        "/api/auth/login",
        json={"email": "survey@kayalaya.app", "password": "password123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    survey_payload = {
        "survey": {
            "experience_level": "beginner",
            "goals": ["flexibility", "stress_relief"],
            "injuries": "none",
        }
    }
    update_res = client.put("/api/auth/me/survey", headers=headers, json=survey_payload)
    assert update_res.status_code == 200
    assert update_res.json()["survey"]["experience_level"] == "beginner"

    # Fetching me also reflects updated survey
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["survey"]["goals"] == ["flexibility", "stress_relief"]


