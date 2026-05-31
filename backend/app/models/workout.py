from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.database import Base

class WorkoutSession(Base):
    __tablename__ = "workout_sessions"
    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id          = Column(UUID(as_uuid=True), nullable=False, index=True)
    event_id         = Column(String, nullable=False)
    session_date     = Column(String, nullable=False)
    duration         = Column(Float)
    distance         = Column(Float)
    pace             = Column(Float)
    speed            = Column(Float)
    heart_rate_avg   = Column(Integer)
    heart_rate_max   = Column(Integer)
    calories_burned  = Column(Integer)
    fatigue_level    = Column(Integer, default=5)
    notes            = Column(Text)
    coach_verified   = Column(Boolean, default=False)
    verified_by      = Column(UUID(as_uuid=True))
    proof_video_url  = Column(String)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
