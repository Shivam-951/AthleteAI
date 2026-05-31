# Rule-based AI engine — no API key needed

def safe_float(val, default=0.0):
    try:
        return float(val) if val is not None else default
    except:
        return default

def safe_int(val, default=0):
    try:
        return int(val) if val is not None else default
    except:
        return default


def get_performance_insights(profile: dict, sessions: list, leaderboard: dict) -> list:
    insights = []

    if not sessions:
        return [{
            "tag":      "Getting Started",
            "text":     "Log your first session to start getting personalized insights.",
            "priority": "high"
        }]

    # --- Pace trend ---
    timed = [
        s for s in sessions
        if s.get("duration") and s.get("distance")
        and safe_float(s.get("duration")) > 0
        and safe_float(s.get("distance")) > 0
    ]

    if len(timed) >= 2:
        paces = [
            safe_float(s["duration"]) / (safe_float(s["distance"]) / 1000)
            for s in timed
        ]
        recent = sum(paces[:3]) / len(paces[:3])
        older  = sum(paces[3:6]) / len(paces[3:6]) if len(paces) > 3 else paces[-1]

        if older > 0:
            delta = ((older - recent) / older) * 100
            if delta > 3:
                insights.append({
                    "tag":      "Endurance",
                    "text":     f"Your pace improved {delta:.1f}% recently. Keep your long run on the schedule to maintain this.",
                    "priority": "high"
                })
            elif delta < -3:
                insights.append({
                    "tag":      "Pace Drop",
                    "text":     f"Your pace dropped {abs(delta):.1f}% recently. Check your recovery and sleep quality.",
                    "priority": "high"
                })

    # --- Fatigue check ---
    recent_sessions = sessions[:7]
    fatigues = [
        safe_int(s.get("fatigue_level"), 5)
        for s in recent_sessions
        if s.get("fatigue_level") is not None
    ]

    if fatigues:
        avg_fatigue = sum(fatigues) / len(fatigues)
        if avg_fatigue >= 7.5:
            insights.append({
                "tag":      "Overtraining",
                "text":     f"Average fatigue is {avg_fatigue:.1f}/10 this week. Take a rest day — overtraining increases injury risk.",
                "priority": "high"
            })
        elif avg_fatigue <= 3:
            insights.append({
                "tag":      "Training Load",
                "text":     "Fatigue is very low. Consider increasing training intensity to keep improving.",
                "priority": "medium"
            })
        else:
            insights.append({
                "tag":      "Fatigue",
                "text":     f"Average fatigue this week is {avg_fatigue:.1f}/10 — within healthy training range.",
                "priority": "low"
            })

    # --- Session frequency ---
    count = len(recent_sessions)
    if count < 3:
        insights.append({
            "tag":      "Consistency",
            "text":     f"Only {count} session{'s' if count != 1 else ''} this week. Aim for at least 4 per week for steady improvement.",
            "priority": "medium"
        })
    elif count >= 6:
        insights.append({
            "tag":      "Consistency",
            "text":     f"Excellent — {count} sessions this week. Make sure at least one day is proper rest or recovery.",
            "priority": "low"
        })
    else:
        insights.append({
            "tag":      "Consistency",
            "text":     f"Good work — {count} sessions this week. Stay consistent to keep climbing the leaderboard.",
            "priority": "medium"
        })

    # --- National rank ---
    rank = leaderboard.get("rank_national")
    if rank is not None:
        if rank <= 50:
            insights.append({
                "tag":      "SAI Eligible",
                "text":     f"You are ranked #{rank} nationally — you are in the SAI talent identification zone. Get your sessions coach-verified now.",
                "priority": "high"
            })
        elif rank <= 200:
            spots = rank - 50
            insights.append({
                "tag":      "Leaderboard",
                "text":     f"You are #{rank} nationally. {spots} spots away from SAI eligibility — keep pushing.",
                "priority": "medium"
            })
        else:
            insights.append({
                "tag":      "Leaderboard",
                "text":     f"You are #{rank} nationally. Focus on verified sessions to climb the rankings faster.",
                "priority": "medium"
            })

    # --- Personal best check ---
    durations = [
        safe_float(s.get("duration"))
        for s in sessions
        if s.get("duration") is not None
        and safe_float(s.get("duration")) > 0
    ]

    if len(durations) >= 2 and durations[0] < durations[1]:
        insights.append({
            "tag":      "Personal Best",
            "text":     "Your last session was your fastest recorded time. Great form — maintain this momentum into your next race.",
            "priority": "high"
        })

    # --- Verified sessions nudge ---
    verified   = [s for s in sessions if s.get("coach_verified")]
    unverified = [s for s in sessions if not s.get("coach_verified")]

    if len(unverified) >= 3 and len(verified) == 0:
        insights.append({
            "tag":      "Verification",
            "text":     f"You have {len(unverified)} unverified sessions. Ask your coach to verify them — only verified sessions count for national ranking.",
            "priority": "medium"
        })

    # Sort by priority and return top 4
    order = {"high": 0, "medium": 1, "low": 2}
    insights.sort(key=lambda x: order.get(x.get("priority", "low"), 3))
    return insights[:4]


def generate_training_plan(
    profile: dict,
    sessions: list,
    recovery_score: int = 70
) -> dict:

    event     = profile.get("primary_event", "100m")
    level     = profile.get("experience_level", "Intermediate")

    sprint_events = ["100m", "200m", "400m"]
    middle_events = ["800m", "1500m"]

    if event in sprint_events:
        week_focus = "Speed & power — short explosive sessions with full recovery"
        days = [
            {
                "day": "Monday", "type": "Speed", "intensity": "High",
                "sessions": ["6 × 60m sprint", "4 × 30m flying start", "Core strength 20min"]
            },
            {
                "day": "Tuesday", "type": "Rest", "intensity": "Off",
                "sessions": ["Active recovery walk 30min", "Foam rolling", "Sleep 8h target"]
            },
            {
                "day": "Wednesday", "type": "Endurance", "intensity": "Medium",
                "sessions": ["5K easy run at 5:30/km", "Drills: A-skip B-skip", "Hip mobility 15min"]
            },
            {
                "day": "Thursday", "type": "Speed", "intensity": "High",
                "sessions": ["4 × 100m race pace", "Block starts 10 × 20m", "Plyometrics 20min"]
            },
            {
                "day": "Friday", "type": "Rest", "intensity": "Off",
                "sessions": ["Full rest", "Nutrition: carb load", "Sleep 8h target"]
            },
            {
                "day": "Saturday", "type": "Race", "intensity": "Max",
                "sessions": ["Race simulation: 100m trial", "Warmup protocol 40min", "Cooldown + ice bath"]
            },
            {
                "day": "Sunday", "type": "Recovery", "intensity": "Low",
                "sessions": ["Easy 3K jog", "Massage or physio", "Review week with coach"]
            },
        ]

    elif event in middle_events:
        week_focus = "Speed endurance — mix of intervals and tempo runs"
        days = [
            {
                "day": "Monday", "type": "Tempo", "intensity": "Medium",
                "sessions": ["4K tempo run at race pace", "Strides 6 × 80m", "Core 15min"]
            },
            {
                "day": "Tuesday", "type": "Easy", "intensity": "Low",
                "sessions": ["5K easy run", "Mobility routine 20min"]
            },
            {
                "day": "Wednesday", "type": "Intervals", "intensity": "High",
                "sessions": ["8 × 400m with 90sec rest", "Drills 20min", "Ice bath"]
            },
            {
                "day": "Thursday", "type": "Rest", "intensity": "Off",
                "sessions": ["Full rest", "Sleep 8h target"]
            },
            {
                "day": "Friday", "type": "Speed", "intensity": "High",
                "sessions": ["6 × 200m fast", "Block work 10 × 30m", "Strength 20min"]
            },
            {
                "day": "Saturday", "type": "Long run", "intensity": "Medium",
                "sessions": ["10K easy run", "Progressive last 2K"]
            },
            {
                "day": "Sunday", "type": "Recovery", "intensity": "Low",
                "sessions": ["Easy walk or rest", "Foam rolling", "Plan next week"]
            },
        ]

    else:
        week_focus = "Aerobic base — consistent mileage with one quality session"
        days = [
            {
                "day": "Monday", "type": "Easy", "intensity": "Low",
                "sessions": ["6K easy run at 6:00/km", "Core 15min"]
            },
            {
                "day": "Tuesday", "type": "Intervals", "intensity": "High",
                "sessions": ["6 × 1K at 5K pace", "2min rest between", "Cooldown 2K"]
            },
            {
                "day": "Wednesday", "type": "Easy", "intensity": "Low",
                "sessions": ["5K easy run", "Mobility 20min"]
            },
            {
                "day": "Thursday", "type": "Tempo", "intensity": "Medium",
                "sessions": ["5K tempo run", "Strides 4 × 100m"]
            },
            {
                "day": "Friday", "type": "Rest", "intensity": "Off",
                "sessions": ["Full rest", "Sleep 8h target"]
            },
            {
                "day": "Saturday", "type": "Long run", "intensity": "Medium",
                "sessions": ["15K long run easy pace", "Fuel every 5K"]
            },
            {
                "day": "Sunday", "type": "Recovery", "intensity": "Low",
                "sessions": ["Easy 3K jog or walk", "Review week"]
            },
        ]

    # adjust for low recovery
    if recovery_score < 50:
        for day in days:
            if day["intensity"] == "High":
                day["intensity"] = "Medium"
                day["sessions"].append("⚠️ Reduced intensity due to low recovery")

    # adjust for beginner
    if level == "Beginner":
        for day in days:
            if day["intensity"] == "Max":
                day["intensity"] = "High"
            if day["type"] == "Race":
                day["type"]     = "Time trial"
                day["sessions"] = [
                    "300m time trial",
                    "Warmup 20min",
                    "Cooldown walk 10min"
                ]

    return {
        "week_focus":     week_focus,
        "event":          event,
        "level":          level,
        "recovery_score": recovery_score,
        "days":           days
    }