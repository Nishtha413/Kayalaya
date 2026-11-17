from pydantic import BaseModel, ConfigDict, Field


class ReferenceAngleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    joint_name: str
    min_angle: float
    max_angle: float
    tolerance_deg: float


class PoseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pose_name: str
    display_name: str
    client_id: str | None = None
    reference_angles: list[ReferenceAngleOut] = []


class ProgramDayPoseOut(BaseModel):
    order_in_day: int
    pose: PoseOut


class ProgramDayOut(BaseModel):
    day_number: int
    title: str
    theme: str
    description: str
    poses: list[ProgramDayPoseOut]


class PracticeAttemptCreate(BaseModel):
    """
    Submitted by the mobile app after the Pose Analysis/Scoring Lead's on-device or
    server-side logic has computed a score for a known pose during Practice Mode.
    """

    pose_id: int | str
    day_number: int
    accuracy_score: float = Field(..., ge=0.0, le=100.0, description="Accuracy percentage between 0 and 100")
    joint_feedback: dict[str, str] | None = None


class FinalTestResultCreate(BaseModel):
    """
    Submitted during the single end-of-course Final Test, where the pose is
    classified (not pre-selected) before scoring.
    """

    expected_pose_id: int | None = None
    predicted_pose_name: str | None = None
    accuracy_score: float | None = Field(default=None, ge=0.0, le=100.0, description="Accuracy percentage between 0 and 100")
    joint_feedback: dict[str, str] | None = None

