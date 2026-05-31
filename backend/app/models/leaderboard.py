from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.database import Base

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"
    id                 = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id            = Column(UUID(as_uuid=True), nullable=False, index=True)
    event_id           = Column(String, nullable=False)
    age_group          = Column(String)
    gender             = Column(String)
    best_time_seconds  = Column(Float)
    rank_national      = Column(Integer)
    rank_state         = Column(Integer)
    rank_age_group     = Column(Integer)
    percentile_national= Column(Float)
    state              = Column(String)
    sai_flagged        = Column(Boolean, default=False)
    verification_status= Column(String, default="pending")
    updated_at         = Column(DateTime(timezone=True), server_default=func.now())
