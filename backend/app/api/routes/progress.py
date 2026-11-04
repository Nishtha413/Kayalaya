from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.pose import Pose
from app.models.session import FinalTestResult, PracticeAttempt
from app.models.user import User
from app.schemas.pose import FinalTestResultCreate, PracticeAttemptCreate

router = APIRouter(prefix="/api/progress", tags=["progress"])


def compute_program_status(db: Session, user_id: int) -> dict:
    """
    A day is complete when the user has at least one practice attempt for every
    pose assigned to that day. The final test unlocks when every day that has
    poses assigned is complete.
    """
    poses = db.query(Pose).filter(Pose.day_number.isnot(None)).all()
    attempted_pose_ids = {
        row.pose_id
        for row in db.query(PracticeAttempt.pose_id).filter(PracticeAttempt.user_id == user_id).distinct()
    }

    by_day: dict[int, list[Pose]] = {}
    for pose in poses:
        by_day.setdefault(pose.day_number, []).append(pose)

    days = []
    for day_number in sorted(by_day):
        day_poses = by_day[day_number]
        done = sum(1 for p in day_poses if p.id in attempted_pose_ids)
        days.append(
            {
                "day": day_number,
                "poses_total": len(day_poses),
                "poses_done": done,
                "completed": done == len(day_poses),
            }
        )

    # Not unlocked if no poses are seeded yet (avoids a vacuous "all done").
    unlocked = bool(days) and all(d["completed"] for d in days)
    return {"days": days, "final_test_unlocked": unlocked}


@router.get("/status")
def get_program_status(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Per-day completion and whether the final test is unlocked. Drives the 7-day screen."""
    return compute_program_status(db, current_user.id)


@router.post("/practice-attempt", status_code=201)
def submit_practice_attempt(
    attempt: PracticeAttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if db.query(Pose).filter(Pose.id == attempt.pose_id).first() is None:
        raise HTTPException(status_code=404, detail="Pose not found")

    record = PracticeAttempt(user_id=current_user.id, **attempt.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"id": record.id, "accuracy_score": record.accuracy_score}


@router.post("/final-test-result", status_code=201)
def submit_final_test_result(
    result: FinalTestResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not compute_program_status(db, current_user.id)["final_test_unlocked"]:
        raise HTTPException(
            status_code=403,
            detail="Final test is locked until all 7 days of practice are complete",
        )

    record = FinalTestResult(user_id=current_user.id, **result.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"id": record.id, "predicted_pose_name": record.predicted_pose_name}


@router.get("/history")
def get_progress_history(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Feeds the Progress Dashboard: practice history plus final test results if completed."""
    practice = db.query(PracticeAttempt).filter(PracticeAttempt.user_id == current_user.id).all()
    final_tests = db.query(FinalTestResult).filter(FinalTestResult.user_id == current_user.id).all()
    return {
        "practice_attempts": [
            {
                "pose_id": p.pose_id,
                "day_number": p.day_number,
                "accuracy_score": p.accuracy_score,
                "created_at": p.created_at,
            }
            for p in practice
        ],
        "final_test_results": [
            {
                "predicted_pose_name": f.predicted_pose_name,
                "accuracy_score": f.accuracy_score,
                "created_at": f.created_at,
            }
            for f in final_tests
        ],
    }
