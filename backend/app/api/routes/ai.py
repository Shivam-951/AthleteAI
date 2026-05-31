from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.database import get_db
from app.models.workout import WorkoutSession
from app.models.user import AthleteProfile
from app.models.leaderboard import LeaderboardEntry
from app.api.routes.auth import get_current_user
from app.services.ai_engine import get_performance_insights, generate_training_plan

router = APIRouter(prefix="/ai", tags=["ai"])


class PlanRequest(BaseModel):
    recovery_score: int = 70


def get_user_context(user, db: Session) -> tuple:
    """Get profile, sessions and leaderboard data for a user."""

    profile = db.query(AthleteProfile).filter(
        AthleteProfile.user_id == user.id
    ).first()

    sessions = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == user.id)
        .order_by(WorkoutSession.session_date.desc())
        .limit(20)
        .all()
    )

    leaderboard = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.user_id == user.id
    ).first()

    # convert to dicts for the engine
    profile_dict = {}
    if profile:
        profile_dict = {
            "name":             user.name,
            "age_group":        profile.age_group,
            "primary_event":    profile.primary_event,
            "experience_level": profile.experience_level,
            "state":            profile.state,
            "fitness_goals":    profile.fitness_goals or [],
            "gender":           profile.gender,
        }
    else:
        profile_dict = {
            "name":             user.name,
            "age_group":        "U20",
            "primary_event":    "100m",
            "experience_level": "Intermediate",
            "state":            None,
            "fitness_goals":    [],
            "gender":           "male",
        }

    sessions_list = [
        {
            "event_id":      s.event_id,
            "duration":      s.duration,
            "distance":      s.distance,
            "session_date":  s.session_date,
            "fatigue_level": s.fatigue_level,
            "coach_verified":s.coach_verified,
        }
        for s in sessions
    ]

    leaderboard_dict = {}
    if leaderboard:
        leaderboard_dict = {
            "rank_national":      leaderboard.rank_national,
            "rank_state":         leaderboard.rank_state,
            "percentile_national":leaderboard.percentile_national,
            "sai_flagged":        leaderboard.sai_flagged,
        }

    return profile_dict, sessions_list, leaderboard_dict


@router.get("/insights")
def get_insights(
    authorization: Optional[str] = Header(None),
    db:            Session       = Depends(get_db)
):
    # if no token — return demo insights
    if not authorization or not authorization.startswith("Bearer "):
        return [
            {
                "tag":      "Getting Started",
                "text":     "Create an account and log your first session to get personalized insights.",
                "priority": "high"
            }
        ]

    try:
        token = authorization.split(" ")[1]
        user  = get_current_user(token, db)
        profile, sessions, leaderboard = get_user_context(user, db)
        insights = get_performance_insights(profile, sessions, leaderboard)
        return insights

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Insight generation failed: {str(e)}")


@router.post("/training-plan")
def get_training_plan(
    body:          PlanRequest,
    authorization: Optional[str] = Header(None),
    db:            Session       = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")

    try:
        token = authorization.split(" ")[1]
        user  = get_current_user(token, db)
        profile, sessions, _ = get_user_context(user, db)
        plan = generate_training_plan(
            profile,
            sessions,
            body.recovery_score
        )
        return plan

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Plan generation failed: {str(e)}")


@router.get("/recovery")
def get_recovery_score(
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
        .limit(7)
        .all()
    )

    if not sessions:
        return {
            "recovery_score": 75,
            "avg_fatigue":    0,
            "sessions_week":  0,
            "rest_days":      7,
            "message":        "No sessions yet — recovery is fresh",
            "factors":        []
        }

    fatigues    = [s.fatigue_level for s in sessions if s.fatigue_level]
    avg_fatigue = sum(fatigues) / len(fatigues) if fatigues else 5
    session_count = len(sessions)
    rest_days     = 7 - session_count

    # base score from fatigue — fatigue 10 = score 10, fatigue 1 = score 90
    base_score = round((10 - avg_fatigue) * 8 + 10)

    # rest day bonus — each rest day adds 4 points
    rest_bonus = min(rest_days * 4, 20)

    # overload penalty — more than 5 sessions in 7 days is risky
    overload_penalty = max(0, session_count - 5) * 8

    # consecutive hard sessions penalty
    high_fatigue_streak = 0
    for s in sessions:
        if (s.fatigue_level or 0) >= 7:
            high_fatigue_streak += 1
        else:
            break

    streak_penalty = max(0, high_fatigue_streak - 2) * 6

    # final score
    recovery_score = base_score + rest_bonus - overload_penalty - streak_penalty
    recovery_score = max(10, min(100, recovery_score))

    # build explanation factors
    factors = []

    if avg_fatigue >= 7:
        factors.append(f"High average fatigue this week ({avg_fatigue:.1f}/10)")
    elif avg_fatigue <= 4:
        factors.append(f"Low fatigue levels ({avg_fatigue:.1f}/10) — body is fresh")

    if session_count >= 6:
        factors.append(f"{session_count} sessions in 7 days — high training load")
    elif session_count <= 2:
        factors.append(f"Only {session_count} sessions this week — well rested")

    if rest_days >= 2:
        factors.append(f"{rest_days} rest days this week — good recovery time")

    if high_fatigue_streak >= 3:
        factors.append(
            f"{high_fatigue_streak} consecutive high-fatigue sessions — "
            f"rest day strongly recommended"
        )

    if overload_penalty > 0:
        factors.append("Training volume is above recommended weekly limit")

    # message
    if recovery_score >= 80:
        message = "Excellent recovery — ready for high intensity training"
    elif recovery_score >= 65:
        message = "Good recovery — moderate to high intensity recommended"
    elif recovery_score >= 45:
        message = "Moderate recovery — keep today's session light"
    else:
        message = "Low recovery — rest day strongly recommended today"

    return {
        "recovery_score": recovery_score,
        "avg_fatigue":    round(avg_fatigue, 1),
        "sessions_week":  session_count,
        "rest_days":      rest_days,
        "message":        message,
        "factors":        factors
    }

@router.get("/weekly-summary")
def weekly_summary(
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
        .limit(7)
        .all()
    )

    if not sessions:
        return {
            "sessions_count":    0,
            "total_distance_km": 0,
            "avg_fatigue":       0,
            "active_days":       [],
            "streak":            0
        }

    total_distance = sum(
        (s.distance or 0) for s in sessions
    ) / 1000

    fatigues    = [s.fatigue_level for s in sessions if s.fatigue_level]
    avg_fatigue = round(sum(fatigues) / len(fatigues), 1) if fatigues else 0

    active_days = list(set(s.session_date for s in sessions))

    return {
        "sessions_count":    len(sessions),
        "total_distance_km": round(total_distance, 1),
        "avg_fatigue":       avg_fatigue,
        "active_days":       active_days,
        "streak":            len(active_days)
    }