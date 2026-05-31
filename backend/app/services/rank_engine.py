from sqlalchemy.orm import Session
from app.models.leaderboard import LeaderboardEntry
from app.models.workout import WorkoutSession
from app.models.user import AthleteProfile

def recompute_leaderboard(db: Session, event_id: str, age_group: str, gender: str):
    """Recompute national ranks for an event/age_group/gender combination."""
    entries = (
        db.query(LeaderboardEntry)
        .filter(
            LeaderboardEntry.event_id  == event_id,
            LeaderboardEntry.age_group == age_group,
            LeaderboardEntry.gender    == gender,
        )
        .order_by(LeaderboardEntry.best_time_seconds.asc())
        .all()
    )
    for i, entry in enumerate(entries, start=1):
        entry.rank_national = i
        # Flag top 50 for SAI
        entry.sai_flagged = (i <= 50)

    # State ranks
    from collections import defaultdict
    by_state = defaultdict(list)
    for e in entries:
        by_state[e.state].append(e)
    for state_entries in by_state.values():
        for j, e in enumerate(state_entries, start=1):
            e.rank_state = j

    db.commit()

def update_personal_best(db: Session, user_id, event_id: str, new_time: float, profile: AthleteProfile):
    entry = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.user_id  == user_id,
        LeaderboardEntry.event_id == event_id,
    ).first()

    if not entry:
        entry = LeaderboardEntry(
            user_id   = user_id,
            event_id  = event_id,
            age_group = profile.age_group if profile else 'Open',
            gender    = profile.gender    if profile else 'male',
            state     = profile.state     if profile else None,
            best_time_seconds = new_time,
        )
        db.add(entry)
    elif new_time < entry.best_time_seconds:
        entry.best_time_seconds = new_time

    db.commit()
    recompute_leaderboard(db, event_id, entry.age_group, entry.gender)
    return entry
