"""
Populate the poses and reference_angles tables from seed_data.json.

Run from the backend folder:
    python -m app.seed.seed

Safe to re-run: poses are matched by pose_name and updated in place, and each
pose's reference angles are replaced with whatever is in the JSON. Edit the JSON
(not the database) when the Pose Analysis/Scoring Lead updates angle ranges.
"""
import json
from pathlib import Path

from app.db.database import Base, SessionLocal, engine
from app.models.pose import Pose, ReferenceAngle

SEED_FILE = Path(__file__).parent / "seed_data.json"


def run() -> None:
    Base.metadata.create_all(bind=engine)
    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))

    db = SessionLocal()
    try:
        for entry in data["poses"]:
            pose = db.query(Pose).filter(Pose.pose_name == entry["pose_name"]).first()
            if pose is None:
                pose = Pose(pose_name=entry["pose_name"])
                db.add(pose)
            pose.display_name = entry["display_name"]
            pose.day_number = entry.get("day_number")
            pose.order_in_day = entry.get("order_in_day")
            db.flush()  # assigns pose.id for new rows

            db.query(ReferenceAngle).filter(ReferenceAngle.pose_id == pose.id).delete()
            for ang in entry.get("reference_angles", []):
                db.add(
                    ReferenceAngle(
                        pose_id=pose.id,
                        joint_name=ang["joint_name"],
                        min_angle=ang["min_angle"],
                        max_angle=ang["max_angle"],
                        tolerance_deg=ang.get("tolerance_deg", 5.0),
                    )
                )
        db.commit()
        print(f"Seeded {len(data['poses'])} poses.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
