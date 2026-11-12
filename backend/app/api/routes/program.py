from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.pose import Pose, PoseClientId, ProgramDay, ProgramDayPose, ReferenceAngle
from app.models.user import User
from app.schemas.pose import PoseOut, ProgramDayOut, ProgramDayPoseOut

router = APIRouter(prefix="/api/program", tags=["program"])


@router.get("/days", response_model=list[ProgramDayOut])
def list_program_days(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    days = db.query(ProgramDay).order_by(ProgramDay.day_number).all()
    assignments = (
        db.query(ProgramDayPose)
        .order_by(ProgramDayPose.day_number, ProgramDayPose.order_in_day)
        .all()
    )
    poses = {pose.id: pose for pose in db.query(Pose).all()}
    client_ids = {row.pose_id: row.client_id for row in db.query(PoseClientId).all()}
    angles_by_pose: dict[int, list[ReferenceAngle]] = {}
    for angle in db.query(ReferenceAngle).all():
        angles_by_pose.setdefault(angle.pose_id, []).append(angle)

    assignments_by_day: dict[int, list[ProgramDayPose]] = {}
    for assignment in assignments:
        assignments_by_day.setdefault(assignment.day_number, []).append(assignment)

    return [
        ProgramDayOut(
            day_number=day.day_number,
            title=day.title,
            theme=day.theme,
            description=day.description,
            poses=[
                ProgramDayPoseOut(
                    order_in_day=assignment.order_in_day,
                    pose=PoseOut(
                        id=poses[assignment.pose_id].id,
                        pose_name=poses[assignment.pose_id].pose_name,
                        display_name=poses[assignment.pose_id].display_name,
                        client_id=client_ids.get(assignment.pose_id),
                        reference_angles=angles_by_pose.get(assignment.pose_id, []),
                    ),
                )
                for assignment in assignments_by_day.get(day.day_number, [])
            ],
        )
        for day in days
    ]