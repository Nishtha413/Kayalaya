from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.pose import Pose, ReferenceAngle
from app.models.user import User
from app.schemas.pose import PoseOut

router = APIRouter(prefix="/api/poses", tags=["poses"])


@router.get("", response_model=list[PoseOut])
def list_poses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Full pose list with reference angles — used by Pose Analysis Lead's scoring logic on-device or server-side."""
    poses = db.query(Pose).order_by(Pose.day_number, Pose.order_in_day).all()
    result = []
    for pose in poses:
        angles = db.query(ReferenceAngle).filter(ReferenceAngle.pose_id == pose.id).all()
        pose_out = PoseOut.model_validate(pose)
        pose_out.reference_angles = angles
        result.append(pose_out)
    return result


@router.get("/{pose_id}", response_model=PoseOut)
def get_pose(pose_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pose = db.query(Pose).filter(Pose.id == pose_id).first()
    if not pose:
        raise HTTPException(status_code=404, detail="Pose not found")
    angles = db.query(ReferenceAngle).filter(ReferenceAngle.pose_id == pose.id).all()
    pose_out = PoseOut.model_validate(pose)
    pose_out.reference_angles = angles
    return pose_out
