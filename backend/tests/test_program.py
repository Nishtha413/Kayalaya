from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def test_list_program_days_unauthorized(client: TestClient):
    response = client.get("/api/program/days")
    assert response.status_code == 401


def test_list_program_days(client: TestClient, seeded_db: Session, auth_user: dict):
    response = client.get("/api/program/days", headers=auth_user["headers"])
    assert response.status_code == 200
    days = response.json()
    assert len(days) == 7

    day1 = next(d for d in days if d["day_number"] == 1)
    assert day1["title"] == "Day 1"
    assert day1["theme"] == "Foundations"
    assert len(day1["poses"]) == 5

    # Positional ordering inside Day 1
    orders = [p["order_in_day"] for p in day1["poses"]]
    assert orders == [1, 2, 3, 4, 5]

    # First pose of Day 1 is tadasana / Mountain Pose
    first_pose = day1["poses"][0]["pose"]
    assert first_pose["pose_name"] == "tadasana"
    assert first_pose["client_id"] == "mountain"
    assert len(first_pose["reference_angles"]) > 0


def test_days_structure_and_order(client: TestClient, seeded_db: Session, auth_user: dict):
    response = client.get("/api/program/days", headers=auth_user["headers"])
    assert response.status_code == 200
    days = response.json()
    assert [d["day_number"] for d in days] == [1, 2, 3, 4, 5, 6, 7]

    for day in days:
        assert "theme" in day
        assert "description" in day
        assert len(day["poses"]) > 0
        for p in day["poses"]:
            assert "order_in_day" in p
            assert "pose" in p
            assert "pose_name" in p["pose"]
            assert "client_id" in p["pose"]
