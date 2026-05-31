from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.user import User, AthleteProfile
from app.config import settings
import uuid
from typing import Optional

router  = APIRouter(prefix="/auth", tags=["auth"])
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Schemas ──────────────────────────────────────────────
class RegisterIn(BaseModel):
    email:    EmailStr
    password: str
    name:     str

class LoginIn(BaseModel):
    email:    EmailStr
    password: str

class ProfileIn(BaseModel):
    age:              Optional[int]   = None
    gender:           str             = "male"
    height_cm:        Optional[float] = None
    weight_kg:        Optional[float] = None
    sport_type:       str             = "athletics"
    primary_event:    str             = "100m"
    age_group:        str             = "U20"
    experience_level: str             = "Intermediate"
    fitness_goals:    list[str]       = []
    state:            Optional[str]   = None
    city:             Optional[str]   = None

    model_config = {"coerce_numbers_to_str": False}

# ── Helpers ──────────────────────────────────────────────
def make_token(user_id: str) -> str:
    exp  = datetime.utcnow() + timedelta(
               minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {"sub": str(user_id), "exp": exp},
        settings.secret_key,
        algorithm=settings.algorithm
    )

def get_current_user(token: str, db: Session) -> User:
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Invalid token")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except Exception:
        raise HTTPException(401, "Invalid or expired token")

# ── Routes ───────────────────────────────────────────────
@router.post("/register")
def register(body: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(
        email           = body.email,
        name            = body.name,
        hashed_password = pwd_ctx.hash(body.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "user": {
            "id":               str(user.id),
            "email":            user.email,
            "name":             user.name,
            "profile_complete": user.profile_complete
        },
        "access_token": make_token(user.id)
    }

@router.post("/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not pwd_ctx.verify(body.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")
    return {
        "user": {
            "id":               str(user.id),
            "email":            user.email,
            "name":             user.name,
            "profile_complete": user.profile_complete
        },
        "access_token": make_token(user.id)
    }

@router.get("/me")
def get_me(token: str, db: Session = Depends(get_db)):
    user    = get_current_user(token, db)
    profile = db.query(AthleteProfile).filter(
                  AthleteProfile.user_id == user.id).first()
    return {
        "id":               str(user.id),
        "email":            user.email,
        "name":             user.name,
        "profile_complete": user.profile_complete,
        "profile":          profile
    }

@router.put("/profile")
def update_profile(
    body:  ProfileIn,
    token: str,
    db:    Session = Depends(get_db)
):
    user = get_current_user(token, db)

    profile = db.query(AthleteProfile).filter(
                  AthleteProfile.user_id == user.id).first()

    if not profile:
        profile = AthleteProfile(user_id=user.id)
        db.add(profile)

    for key, val in body.dict().items():
        setattr(profile, key, val)

    user.profile_complete = True
    db.commit()
    db.refresh(profile)

    return {
        "message": "Profile updated",
        "profile": {
            "age":              profile.age,
            "gender":           profile.gender,
            "primary_event":    profile.primary_event,
            "age_group":        profile.age_group,
            "experience_level": profile.experience_level,
            "state":            profile.state,
            "city":             profile.city,
            "fitness_goals":    profile.fitness_goals,
        }
    }