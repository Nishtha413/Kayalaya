from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def test_initial_progress_status(client: TestClient, seeded_db: Session, auth_user: dict):
    response = client.get("/api/progress/status", headers=auth_user["headers"])
    assert response.status_code == 200
    data = response.json()
    assert data["final_test_unlocked"] is False
    assert len(data["days"]) == 7

    for day in data["days"]:
        assert day["poses_done"] == 0
        assert day["completed"] is False
        assert day["poses_total"] > 0


def test_final_test_locked_by_default(client: TestClient, seeded_db: Session, auth_user: dict):
    response = client.post(
        "/api/progress/final-test-result",
        headers=auth_user["headers"],
        json={
            "predicted_pose_name": "tadasana",
            "accuracy_score": 88.5,
            "joint_feedback": {"left_knee": "good alignment"},
        },
    )
    assert response.status_code == 403
    assert "locked" in response.json()["detail"].lower()


def test_practice_attempt_unknown_pose(client: TestClient, seeded_db: Session, auth_user: dict):
    response = client.post(
        "/api/progress/practice-attempt",
        headers=auth_user["headers"],
        json={
            "pose_id": "nonexistent_pose",
            "day_number": 1,
            "accuracy_score": 75.0,
        },
    )
    assert response.status_code == 404
    assert "Pose not found" in response.json()["detail"]


def test_practice_attempt_wrong_day_assignment(
    client: TestClient, seeded_db: Session, auth_user: dict
):
    # warrior-2 (virabhadrasana_ii) is on Day 2, NOT Day 1
    response = client.post(
        "/api/progress/practice-attempt",
        headers=auth_user["headers"],
        json={
            "pose_id": "warrior-2",
            "day_number": 1,
            "accuracy_score": 80.0,
        },
    )
    assert response.status_code == 422
    assert "not assigned to that day" in response.json()["detail"]


def test_practice_attempt_success(client: TestClient, seeded_db: Session, auth_user: dict):
    # Submit using client_id slug
    res_slug = client.post(
        "/api/progress/practice-attempt",
        headers=auth_user["headers"],
        json={
            "pose_id": "mountain",
            "day_number": 1,
            "accuracy_score": 92.0,
            "joint_feedback": {"left_hip_knee_ankle": "Great alignment"},
        },
    )
    assert res_slug.status_code == 201
    assert res_slug.json()["accuracy_score"] == 92.0
    assert "id" in res_slug.json()

    # Submit using Sanskrit pose_name
    res_name = client.post(
        "/api/progress/practice-attempt",
        headers=auth_user["headers"],
        json={
            "pose_id": "balasana",
            "day_number": 1,
            "accuracy_score": 85.0,
        },
    )
    assert res_name.status_code == 201


def test_day_completion_and_unlock_progression(
    client: TestClient, seeded_db: Session, auth_user: dict
):
    headers = auth_user["headers"]

    # Retrieve all program days to know all assignments
    program_res = client.get("/api/program/days", headers=headers)
    assert program_res.status_code == 200
    program_days = program_res.json()

    # 1. Complete Day 1 poses
    day1 = program_days[0]
    for pose_entry in day1["poses"]:
        p_res = client.post(
            "/api/progress/practice-attempt",
            headers=headers,
            json={
                "pose_id": pose_entry["pose"]["client_id"],
                "day_number": 1,
                "accuracy_score": 85.0,
            },
        )
        assert p_res.status_code == 201

    # Check status: Day 1 should be completed, final test still locked
    status1 = client.get("/api/progress/status", headers=headers).json()
    assert status1["days"][0]["completed"] is True
    assert status1["days"][0]["poses_done"] == status1["days"][0]["poses_total"]
    assert status1["days"][1]["completed"] is False
    assert status1["final_test_unlocked"] is False

    # 2. Complete remaining days (Days 2 to 7)
    for day in program_days[1:]:
        for pose_entry in day["poses"]:
            p_res = client.post(
                "/api/progress/practice-attempt",
                headers=headers,
                json={
                    "pose_id": pose_entry["pose"]["client_id"],
                    "day_number": day["day_number"],
                    "accuracy_score": 88.0,
                },
            )
            assert p_res.status_code == 201

    # Check status: all days completed, final test unlocked!
    status_final = client.get("/api/progress/status", headers=headers).json()
    for day_stat in status_final["days"]:
        assert day_stat["completed"] is True
    assert status_final["final_test_unlocked"] is True

    # 3. Final test can now be submitted successfully
    final_test_res = client.post(
        "/api/progress/final-test-result",
        headers=headers,
        json={
            "predicted_pose_name": "tadasana",
            "accuracy_score": 95.0,
            "joint_feedback": {"left_knee": "optimal"},
        },
    )
    assert final_test_res.status_code == 201
    assert final_test_res.json()["predicted_pose_name"] == "tadasana"

    # 4. Progress history reflects attempts and final test
    history_res = client.get("/api/progress/history", headers=headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history["practice_attempts"]) >= len(day1["poses"])
    assert len(history["final_test_results"]) == 1
    assert history["final_test_results"][0]["predicted_pose_name"] == "tadasana"
    assert history["final_test_results"][0]["accuracy_score"] == 95.0


def test_user_progress_isolation(client: TestClient, seeded_db: Session, auth_user: dict):
    """Ensure user A's progress does not leak or unlock user B's final test."""
    headers_a = auth_user["headers"]

    # Register and login user B
    client.post(
        "/api/auth/register",
        json={"email": "user_b@kayalaya.app", "password": "password123"},
    )
    login_b = client.post(
        "/api/auth/login",
        json={"email": "user_b@kayalaya.app", "password": "password123"},
    )
    headers_b = {"Authorization": f"Bearer {login_b.json()['access_token']}"}

    # User A submits an attempt for Day 1
    client.post(
        "/api/progress/practice-attempt",
        headers=headers_a,
        json={"pose_id": "mountain", "day_number": 1, "accuracy_score": 90.0},
    )

    # User B should still have 0 done on Day 1
    status_b = client.get("/api/progress/status", headers=headers_b).json()
    assert status_b["days"][0]["poses_done"] == 0

    # User B history should be empty
    history_b = client.get("/api/progress/history", headers=headers_b).json()
    assert len(history_b["practice_attempts"]) == 0
