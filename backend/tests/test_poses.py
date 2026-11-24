from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def test_health_check(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_list_poses(client: TestClient, seeded_db: Session, auth_user: dict):
    response = client.get("/api/poses", headers=auth_user["headers"])
    assert response.status_code == 200
    poses = response.json()
    assert len(poses) == 8

    # Mountain pose is tadasana
    mountain = next((p for p in poses if p["pose_name"] == "tadasana"), None)
    assert mountain is not None
    assert mountain["display_name"] == "Mountain Pose"
    assert mountain["client_id"] == "mountain"
    assert len(mountain["reference_angles"]) > 0

    first_angle = mountain["reference_angles"][0]
    assert "joint_name" in first_angle
    assert "min_angle" in first_angle
    assert "max_angle" in first_angle
    assert "tolerance_deg" in first_angle


def test_get_pose_by_numeric_id(client: TestClient, seeded_db: Session, auth_user: dict):
    # First get list to find id
    list_res = client.get("/api/poses", headers=auth_user["headers"])
    first_pose = list_res.json()[0]

    response = client.get(f"/api/poses/{first_pose['id']}", headers=auth_user["headers"])
    assert response.status_code == 200
    assert response.json()["id"] == first_pose["id"]
    assert response.json()["pose_name"] == first_pose["pose_name"]


def test_get_pose_by_client_id(client: TestClient, seeded_db: Session, auth_user: dict):
    response = client.get("/api/poses/warrior-2", headers=auth_user["headers"])
    assert response.status_code == 200
    data = response.json()
    assert data["pose_name"] == "virabhadrasana_ii"
    assert data["display_name"] == "Warrior II"


def test_get_pose_by_pose_name(client: TestClient, seeded_db: Session, auth_user: dict):
    response = client.get("/api/poses/vrikshasana", headers=auth_user["headers"])
    assert response.status_code == 200
    data = response.json()
    assert data["client_id"] == "tree"
    assert data["display_name"] == "Tree Pose"


def test_get_pose_not_found(client: TestClient, seeded_db: Session, auth_user: dict):
    response = client.get("/api/poses/invalid_pose_name", headers=auth_user["headers"])
    assert response.status_code == 404
    assert response.json()["detail"] == "Pose not found"
