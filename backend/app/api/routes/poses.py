from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.pose import Pose, PoseClientId, ReferenceAngle
from app.models.user import User
from app.schemas.pose import PoseOut

router = APIRouter(prefix="/api/poses", tags=["poses"])


def find_pose(db: Session, identifier: str) -> Pose | None:
    if identifier.isdecimal():
        pose = db.query(Pose).filter(Pose.id == int(identifier)).first()
        if pose:
            return pose

    pose = (
        db.query(Pose)
        .join(PoseClientId, PoseClientId.pose_id == Pose.id)
        .filter(PoseClientId.client_id == identifier)
        .first()
    )
    if pose:
        return pose
    return db.query(Pose).filter(Pose.pose_name == identifier).first()


@router.get("", response_model=list[PoseOut])
def list_poses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Full pose list with reference angles — used by Pose Analysis Lead's scoring logic on-device or server-side."""
    poses = db.query(Pose).order_by(Pose.id).all()
    result = []
    for pose in poses:
        client_id = db.query(PoseClientId.client_id).filter(PoseClientId.pose_id == pose.id).scalar()
        angles = db.query(ReferenceAngle).filter(ReferenceAngle.pose_id == pose.id).all()
        result.append(
            PoseOut(
                id=pose.id,
                pose_name=pose.pose_name,
                display_name=pose.display_name,
                client_id=client_id,
                reference_angles=angles,
            )
        )
    return result


@router.get("/{pose_identifier}", response_model=PoseOut)
def get_pose(
    pose_identifier: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pose = find_pose(db, pose_identifier)
    if not pose:
        raise HTTPException(status_code=404, detail="Pose not found")
    client_id = db.query(PoseClientId.client_id).filter(PoseClientId.pose_id == pose.id).scalar()
    angles = db.query(ReferenceAngle).filter(ReferenceAngle.pose_id == pose.id).all()
    return PoseOut(
        id=pose.id,
        pose_name=pose.pose_name,
        display_name=pose.display_name,
        client_id=client_id,
        reference_angles=angles,
    )
