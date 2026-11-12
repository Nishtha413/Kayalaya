import os

# Configure test environment before any app modules load
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET_KEY"] = "test_jwt_secret_key_for_automated_testing_123456789"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app
from app.seed.seed import seed_database


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh in-memory SQLite database for each test."""
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session: Session):
    """FastAPI TestClient with the database dependency overridden."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def seeded_db(db_session: Session):
    """Database populated with poses, 7-day program schedule, and angles from seed_data.json."""
    seed_database(db_session)
    return db_session


@pytest.fixture(scope="function")
def auth_user(client: TestClient, db_session: Session):
    """Registers and authenticates a test user, returning token and authorization header."""
    user_payload = {
        "email": "testyogi@example.com",
        "password": "ValidPassword123!",
        "display_name": "Test Yogi",
    }
    reg_res = client.post("/api/auth/register", json=user_payload)
    assert reg_res.status_code == 201

    login_res = client.post(
        "/api/auth/login",
        json={"email": user_payload["email"], "password": user_payload["password"]},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return {
        "user": reg_res.json(),
        "token": token,
        "headers": headers,
    }
