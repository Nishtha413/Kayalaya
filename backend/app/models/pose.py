from sqlalchemy import Column, Float, ForeignKey, Integer, String, UniqueConstraint

from app.db.database import Base


class Pose(Base):
    __tablename__ = "poses"

    id = Column(Integer, primary_key=True, index=True)
    pose_name = Column(String, unique=True, index=True, nullable=False)  # e.g. "tadasana"
    display_name = Column(String, nullable=False)  # e.g. "Mountain Pose"


class PoseClientId(Base):
    __tablename__ = "pose_client_ids"

    pose_id = Column(Integer, ForeignKey("poses.id"), primary_key=True)
    client_id = Column(String, unique=True, nullable=False)


class ProgramDay(Base):
    __tablename__ = "program_days"

    day_number = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    theme = Column(String, nullable=False)
    description = Column(String, nullable=False)


class ProgramDayPose(Base):
    __tablename__ = "program_day_poses"
    __table_args__ = (UniqueConstraint("day_number", "order_in_day"),)

    day_number = Column(Integer, ForeignKey("program_days.day_number"), primary_key=True)
    pose_id = Column(Integer, ForeignKey("poses.id"), primary_key=True)
    order_in_day = Column(Integer, nullable=False)


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
