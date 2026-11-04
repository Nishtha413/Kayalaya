from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, poses, program, progress
from app.core.config import settings
from app.db.database import Base, engine

# Creates tables if they don't exist. Fine for early development;
# switch to Alembic migrations once the schema stabilizes.
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# Allow the React Native app (and Expo dev tools) to call this API during development.
# Tighten this before any real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(poses.router)
app.include_router(program.router)
app.include_router(progress.router)


@app.get("/")
def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}
