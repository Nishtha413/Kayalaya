from sqlalchemy import Column, Float, ForeignKey, Integer, String

from app.db.database import Base


class Pose(Base):
    __tablename__ = "poses"

    id = Column(Integer, primary_key=True, index=True)
    pose_name = Column(String, unique=True, index=True, nullable=False)  # e.g. "tadasana"
    display_name = Column(String, nullable=False)  # e.g. "Mountain Pose"
    day_number = Column(Integer, nullable=True)  # which day (1-7) of the guided program this pose belongs to
    order_in_day = Column(Integer, nullable=True)


class ReferenceAngle(Base):
    """
    One row per (pose, joint) pair — matches the reference_angle_contract.json
    shape agreed with the Pose Analysis/Scoring Lead.
    """

    __tablename__ = "reference_angles"

    id = Column(Integer, primary_key=True, index=True)
    pose_id = Column(Integer, ForeignKey("poses.id"), nullable=False)
    joint_name = Column(String, nullable=False)  # e.g. "left_hip_knee_ankle"
    min_angle = Column(Float, nullable=False)
    max_angle = Column(Float, nullable=False)
    tolerance_deg = Column(Float, default=5.0)
