from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.database import get_db
from app.models.workout import WorkoutSession
from app.models.user import AthleteProfile
from app.models.leaderboard import LeaderboardEntry
from app.api.routes.auth import get_current_user
from app.services.rank_engine import update_personal_best
import uuid

router = APIRouter(prefix="/workouts", tags=["workouts"])

# ── Schemas ──────────────────────────────────────────────
class WorkoutIn(BaseModel):
    event_id:       str
    session_date:   str
    duration:       float
    distance:       Optional[float] = None
    heart_rate_avg: Optional[int]   = None
    fatigue_level:  int             = 5
    notes:          Optional[str]   = None

# ── Routes ───────────────────────────────────────────────
@router.post("")
def log_workout(
    body:          WorkoutIn,
    authorization: Optional[str] = Header(None),
    db:            Session       = Depends(get_db)
):
    # get user from token
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = authorization.split(" ")[1]
    user  = get_current_user(token, db)

    # calculate pace if distance provided
    pace  = None
    speed = None

    sprint_events = ['100m', '200m', '400m']

    if body.distance and body.distance > 0:
        distance_km = body.distance / 1000
        # pace in seconds per km — only meaningful for distance events
        if body.event_id not in sprint_events:
            pace = round(body.duration / distance_km, 2)
        # speed in km/h — meaningful for all events
        speed = round((distance_km / body.duration) * 3600, 2)
            
    session = WorkoutSession(
        user_id        = user.id,
        event_id       = body.event_id,
        session_date   = body.session_date,
        duration       = body.duration,
        distance       = body.distance,
        pace           = pace,
        speed          = speed,
        heart_rate_avg = body.heart_rate_avg,
        fatigue_level  = body.fatigue_level,
        notes          = body.notes,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # update leaderboard personal best
    profile = db.query(AthleteProfile).filter(
                  AthleteProfile.user_id == user.id).first()
    update_personal_best(db, user.id, body.event_id, body.duration, profile)

    return {
        "id":            str(session.id),
        "event_id":      session.event_id,
        "duration":      session.duration,
        "distance":      session.distance,
        "pace":          session.pace,
        "session_date":  session.session_date,
        "fatigue_level": session.fatigue_level,
        "coach_verified":session.coach_verified,
        "message":       "Session logged successfully"
    }

@router.get("")
def list_workouts(
    authorization: Optional[str] = Header(None),
    limit:         int           = 20,
    db:            Session       = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = authorization.split(" ")[1]
    user  = get_current_user(token, db)

    sessions = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == user.id)
        .order_by(WorkoutSession.session_date.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id":            str(s.id),
            "event_id":      s.event_id,
            "duration":      s.duration,
            "distance":      s.distance,
            "pace":          s.pace,
            "session_date":  s.session_date,
            "fatigue_level": s.fatigue_level,
            "coach_verified":s.coach_verified,
            "notes":         s.notes,
        }
        for s in sessions
    ]

@router.get("/stats")
def get_stats(
    authorization: Optional[str] = Header(None),
    db:            Session       = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = authorization.split(" ")[1]
    user  = get_current_user(token, db)

    sessions = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == user.id)
        .order_by(WorkoutSession.session_date.desc())
        .all()
    )

    if not sessions:
        return {
            "total_sessions":   0,
            "verified_sessions":0,
            "total_distance_km":0,
            "avg_fatigue":      0,
            "personal_bests":   {}
        }

    total_distance = sum(
        (s.distance or 0) for s in sessions
    ) / 1000

    verified = [s for s in sessions if s.coach_verified]

    fatigues = [s.fatigue_level for s in sessions if s.fatigue_level]
    avg_fatigue = round(sum(fatigues) / len(fatigues), 1) if fatigues else 0

    # personal bests per event
    pbs = {}
    for s in sessions:
        if s.event_id not in pbs or s.duration < pbs[s.event_id]:
            pbs[s.event_id] = s.duration

    return {
        "total_sessions":    len(sessions),
        "verified_sessions": len(verified),
        "total_distance_km": round(total_distance, 1),
        "avg_fatigue":       avg_fatigue,
        "personal_bests":    pbs
    }

@router.delete("/{workout_id}")
def delete_workout(
    workout_id:    str,
    authorization: Optional[str] = Header(None),
    db:            Session       = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = authorization.split(" ")[1]
    user  = get_current_user(token, db)

    session = db.query(WorkoutSession).filter(
        WorkoutSession.id      == workout_id,
        WorkoutSession.user_id == user.id
    ).first()

    if not session:
        raise HTTPException(404, "Session not found")

    db.delete(session)
    db.commit()
    return {"message": "Session deleted"}

@router.post("/{workout_id}/verify")
def verify_workout(
    workout_id:    str,
    authorization: Optional[str] = Header(None),
    db:            Session       = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = authorization.split(" ")[1]
    user  = get_current_user(token, db)

    # only coaches can verify — check flag
    if not user.is_coach:
        raise HTTPException(403, "Only coaches can verify sessions")

    session = db.query(WorkoutSession).filter(
        WorkoutSession.id == workout_id
    ).first()

    if not session:
        raise HTTPException(404, "Session not found")

    session.coach_verified = True
    session.verified_by    = user.id
    db.commit()

    return {"message": "Session verified", "workout_id": workout_id}