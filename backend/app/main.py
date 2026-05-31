from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, workouts, leaderboard, ai
from app.db.database import Base, engine

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AthleteAI API",
    description="Backend for the AthleteAI athlete performance platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api")
app.include_router(workouts.router,    prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(ai.router,          prefix="/api")

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "AthleteAI API"}
