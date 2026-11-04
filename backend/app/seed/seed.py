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
from app.models.pose import (
    Pose,
    PoseClientId,
    ProgramDay,
    ProgramDayPose,
    ReferenceAngle,
)

SEED_FILE = Path(__file__).parent / "seed_data.json"


def run() -> None:
    Base.metadata.create_all(bind=engine)
    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))

    db = SessionLocal()
    try:
        db.query(ProgramDayPose).delete()
        db.query(ProgramDay).delete()
        db.query(PoseClientId).delete()
        pose_ids: dict[str, int] = {}

        for entry in data["poses"]:
            pose = db.query(Pose).filter(Pose.pose_name == entry["pose_name"]).first()
            if pose is None:
                pose = Pose(pose_name=entry["pose_name"])
                db.add(pose)
            pose.display_name = entry["display_name"]
            db.flush()  # assigns pose.id for new rows
            pose_ids[pose.pose_name] = pose.id
            db.add(PoseClientId(pose_id=pose.id, client_id=entry["client_id"]))

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
        for entry in data["days"]:
            day = ProgramDay(
                day_number=entry["day_number"],
                title=entry["title"],
                theme=entry["theme"],
                description=entry["description"],
            )
            db.add(day)
            for order_in_day, pose_name in enumerate(entry["poses"], start=1):
                if pose_name not in pose_ids:
                    raise ValueError(f"Unknown pose in day {day.day_number}: {pose_name}")
                db.add(
                    ProgramDayPose(
                        day_number=day.day_number,
                        pose_id=pose_ids[pose_name],
                        order_in_day=order_in_day,
                    )
                )
        db.commit()
        print(f"Seeded {len(data['poses'])} poses across {len(data['days'])} days.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
