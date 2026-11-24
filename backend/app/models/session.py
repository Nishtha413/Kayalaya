from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, Integer, String, func

from app.db.database import Base


class PracticeAttempt(Base):
    """A single scored pose attempt during the 7-day guided program (pose already known)."""

    __tablename__ = "practice_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pose_id = Column(Integer, ForeignKey("poses.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    accuracy_score = Column(Float, nullable=False)  # 0-100
    joint_feedback = Column(JSON, nullable=True)  # e.g. {"left_knee": "straighten your knee"}
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FinalTestResult(Base):
    """
    One row per pose attempted during the single end-of-course final test.
    predicted_pose_name is filled in by the Pose Analysis Lead's classification step,
    since the app does NOT know the target pose in advance here.
    """

    __tablename__ = "final_test_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expected_pose_id = Column(Integer, ForeignKey("poses.id"), nullable=True)
    predicted_pose_name = Column(String, nullable=True)
    accuracy_score = Column(Float, nullable=True)
    joint_feedback = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
