# AthleteAI — Full Stack Project

## Project Structure
```
athleteai/          ← React + Vite frontend
  src/
    app/            ← Router, App root
    pages/          ← Landing, Login, Register, Onboarding, Dashboard,
                       Leaderboard, LogWorkout, Training, Analytics, Profile
    components/
      layout/       ← Navbar, PageWrapper
      ui/           ← Button, Badge, Modal, StatCard, Spinner
      charts/       ← PaceChart, ProgressChart, RecoveryRing
      dashboard/    ← InsightCard, AchievementGrid, WeeklyStreak
      leaderboard/  ← LeaderboardTable, EventSelector, SAIBanner
      workout/      ← WorkoutForm, SessionCard
    hooks/          ← useAuth, useWorkouts, useLeaderboard, useAI
    store/          ← authStore (Zustand), athleteStore
    services/       ← api.js, authService, workoutService,
                       leaderboardService, aiService
    constants/      ← sports.js, states.js, benchmarks.js
    utils/          ← formatTime, calcPace, rankUtils

backend/            ← FastAPI Python backend
  app/
    main.py         ← FastAPI entry, CORS, routers
    config.py       ← Settings, env vars
    db/database.py  ← SQLAlchemy engine, session
    models/         ← User, AthleteProfile, WorkoutSession, LeaderboardEntry
    api/routes/     ← auth.py, workouts.py, leaderboard.py, ai.py
    services/
      ai_engine.py  ← Claude API — insights + training plan generation
      rank_engine.py← National rank computation, SAI flagging
```

## Setup

### Frontend
```bash
cd athleteai
npm install
npm run dev        # runs on http://localhost:3000
```

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env    # add your ANTHROPIC_API_KEY and DATABASE_URL
uvicorn app.main:app --reload  # runs on http://localhost:8000
```

### Database (PostgreSQL)
```sql
CREATE DATABASE athleteai;
CREATE USER athlete WITH PASSWORD 'athlete';
GRANT ALL PRIVILEGES ON DATABASE athleteai TO athlete;
```

## Key Features Built
- Full auth flow: register → onboarding → JWT login
- Dashboard with charts, AI insights, recovery, streaks
- National leaderboard with event/age group filters
- Workout logger with pace calculation
- AI training plan generator (Claude API)
- Analytics with benchmark comparison
- SAI talent pipeline integration

## Environment Variables
```
VITE_API_URL=http://localhost:8000/api    # frontend
ANTHROPIC_API_KEY=sk-ant-...             # backend
DATABASE_URL=postgresql://...            # backend
SECRET_KEY=your-jwt-secret               # backend
```
