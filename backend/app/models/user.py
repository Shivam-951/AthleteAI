from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email            = Column(String, unique=True, index=True, nullable=False)
    name             = Column(String, nullable=False)
    hashed_password  = Column(String, nullable=False)
    profile_complete = Column(Boolean, default=False)
    is_coach         = Column(Boolean, default=False)
    sai_authorized   = Column(Boolean, default=False)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())

class AthleteProfile(Base):
    __tablename__ = "athlete_profiles"
    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id          = Column(UUID(as_uuid=True), nullable=False, index=True)
    age              = Column(Integer)
    gender           = Column(String, default="male")
    height_cm        = Column(Float)
    weight_kg        = Column(Float)
    sport_type       = Column(String, default="athletics")
    primary_event    = Column(String, default="100m")
    age_group        = Column(String, default="U20")
    experience_level = Column(String, default="Intermediate")
    fitness_goals    = Column(JSON, default=list)
    state            = Column(String)
    city             = Column(String)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
