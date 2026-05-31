from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.db.database import get_db
from app.models.leaderboard import LeaderboardEntry
from app.models.user import User, AthleteProfile
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("")
def get_leaderboard(
    event_id:  str           = "100m",
    age_group: str           = "U20",
    gender:    str           = "male",
    state:     Optional[str] = None,
    limit:     int           = 50,
    db:        Session       = Depends(get_db)
):
    query = (
        db.query(LeaderboardEntry, User.name)
        .join(User, User.id == LeaderboardEntry.user_id)
        .filter(
            LeaderboardEntry.event_id  == event_id,
            LeaderboardEntry.age_group == age_group,
            LeaderboardEntry.gender    == gender,
        )
    )

    if state:
        query = query.filter(LeaderboardEntry.state == state)

    rows = (
        query
        .order_by(LeaderboardEntry.best_time_seconds.asc())
        .limit(limit)
        .all()
    )

    return [
        {
            "rank":        entry.rank_national or (i + 1),
            "user_id":     str(entry.user_id),
            "name":        name,
            "state":       entry.state,
            "time":        entry.best_time_seconds,
            "age_group":   entry.age_group,
            "gender":      entry.gender,
            "verified":    entry.verification_status == "verified",
            "sai_flagged": entry.sai_flagged,
            "percentile":  entry.percentile_national,
        }
        for i, (entry, name) in enumerate(rows)
    ]


@router.get("/me")
def my_ranks(
    authorization: Optional[str] = Header(None),
    db:            Session       = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = authorization.split(" ")[1]
    user  = get_current_user(token, db)

    entries = (
        db.query(LeaderboardEntry)
        .filter(LeaderboardEntry.user_id == user.id)
        .all()
    )

    if not entries:
        return {
            "ranks":          [],
            "best_rank":      None,
            "sai_eligible":   False,
            "total_athletes": 0
        }

    ranks = [
        {
            "event_id":          e.event_id,
            "best_time":         e.best_time_seconds,
            "rank_national":     e.rank_national,
            "rank_state":        e.rank_state,
            "percentile":        e.percentile_national,
            "sai_flagged":       e.sai_flagged,
            "verification_status": e.verification_status,
        }
        for e in entries
    ]

    best_rank = min(
        (e.rank_national for e in entries if e.rank_national),
        default=None
    )

    return {
        "ranks":        ranks,
        "best_rank":    best_rank,
        "sai_eligible": any(e.sai_flagged for e in entries),
        "total_athletes": db.query(LeaderboardEntry).count()
    }


@router.get("/stats")
def leaderboard_stats(db: Session = Depends(get_db)):
    total     = db.query(LeaderboardEntry).count()
    sai_count = db.query(LeaderboardEntry).filter(
                    LeaderboardEntry.sai_flagged == True).count()
    events    = db.query(
                    LeaderboardEntry.event_id,
                    func.count(LeaderboardEntry.id)
                ).group_by(LeaderboardEntry.event_id).all()

    return {
        "total_ranked_athletes": total,
        "sai_flagged_athletes":  sai_count,
        "events": [
            {"event": e, "count": c} for e, c in events
        ]
    }