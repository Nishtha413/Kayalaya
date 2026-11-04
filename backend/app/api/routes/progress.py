from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.pose import Pose, PoseClientId, ProgramDay, ProgramDayPose
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
    days = db.query(ProgramDay).order_by(ProgramDay.day_number).all()
    assignments = db.query(ProgramDayPose).all()
    attempted_assignments = {
        (row.day_number, row.pose_id)
        for row in db.query(PracticeAttempt.day_number, PracticeAttempt.pose_id)
        .filter(PracticeAttempt.user_id == user_id)
        .distinct()
    }

    assignments_by_day: dict[int, list[ProgramDayPose]] = {}
    for assignment in assignments:
        assignments_by_day.setdefault(assignment.day_number, []).append(assignment)

    day_status = []
    for day in days:
        day_assignments = assignments_by_day.get(day.day_number, [])
        done = sum(
            1
            for assignment in day_assignments
            if (day.day_number, assignment.pose_id) in attempted_assignments
        )
        day_status.append(
            {
                "day": day.day_number,
                "title": day.title,
                "theme": day.theme,
                "poses_total": len(day_assignments),
                "poses_done": done,
                "completed": bool(day_assignments) and done == len(day_assignments),
            }
        )

    # Not unlocked if no poses are seeded yet (avoids a vacuous "all done").
    unlocked = bool(day_status) and all(day["completed"] for day in day_status)
    return {"days": day_status, "final_test_unlocked": unlocked}


@router.get("/status")
def get_program_status(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Per-day completion and whether the final test is unlocked. Drives the 7-day screen."""
    return compute_program_status(db, current_user.id)


def resolve_pose_id(db: Session, identifier: int | str) -> int | None:
    if isinstance(identifier, int):
        pose = db.query(Pose).filter(Pose.id == identifier).first()
        return pose.id if pose else None

    pose = (
        db.query(Pose)
        .join(PoseClientId, PoseClientId.pose_id == Pose.id)
        .filter(PoseClientId.client_id == identifier)
        .first()
    )
    if pose:
        return pose.id
    pose = db.query(Pose).filter(Pose.pose_name == identifier).first()
    return pose.id if pose else None


@router.post("/practice-attempt", status_code=201)
def submit_practice_attempt(
    attempt: PracticeAttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pose_id = resolve_pose_id(db, attempt.pose_id)
    if pose_id is None:
        raise HTTPException(status_code=404, detail="Pose not found")
    assignment = (
        db.query(ProgramDayPose)
        .filter(
            ProgramDayPose.day_number == attempt.day_number,
            ProgramDayPose.pose_id == pose_id,
        )
        .first()
    )
    if assignment is None:
        raise HTTPException(status_code=422, detail="Pose is not assigned to that day")

    record = PracticeAttempt(
        user_id=current_user.id,
        pose_id=pose_id,
        day_number=attempt.day_number,
        accuracy_score=attempt.accuracy_score,
        joint_feedback=attempt.joint_feedback,
    )
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
