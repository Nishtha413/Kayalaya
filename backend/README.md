# KayaLaya Backend

FastAPI + PostgreSQL backend for the KayaLaya mobile app.

## Structure

```
app/
  main.py            → FastAPI app entry point, router registration
  core/
    config.py         → environment settings
    security.py        → password hashing + JWT
  db/
    database.py        → SQLAlchemy engine/session setup
  models/
    user.py             → User table
    pose.py              → Pose + ReferenceAngle tables (matches the reference_angle_contract.json shape)
    session.py            → PracticeAttempt + FinalTestResult tables
  schemas/
    auth.py               → request/response shapes for auth
    pose.py                → request/response shapes for poses + scoring submissions
  api/
    deps.py                 → get_current_user (JWT) dependency
    routes/
      auth.py                 → /api/auth/register, /api/auth/login
      poses.py                 → /api/poses, /api/poses/{id}
      progress.py                → /api/progress/status, /practice-attempt, /final-test-result, /history
  seed/
    seed_data.json              → poses, day assignments, reference angles (edit this, not the DB)
    seed.py                      → loads seed_data.json into the database
```

## Option A: Run with Docker (recommended for team consistency)

```bash
docker compose up --build
```

This starts both PostgreSQL and the API. Visit http://localhost:8000/docs for interactive Swagger docs.

## Option B: Run locally without Docker

1. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Make sure PostgreSQL is running locally and matches the connection details in `.env` (copy `.env.example` → `.env` and edit as needed).
3. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
4. Visit http://localhost:8000/docs.

## Seeding pose data

After the API/database is up, load the poses and reference angles:

```bash
python -m app.seed.seed            # local
docker compose exec api python -m app.seed.seed   # Docker
```

Safe to re-run. When the Pose Analysis/Scoring Lead updates angle ranges, they edit
`app/seed/seed_data.json` and you re-run the seed. Only `tadasana` has (provisional) angles so far,
and the day assignments are a draft for the group to confirm.

## Day-unlock logic

- `GET /api/progress/status` returns per-day completion and `final_test_unlocked`.
- A day is complete when the user has at least one practice attempt for every pose assigned to that day.
- `POST /api/progress/final-test-result` returns 403 until all days are complete.
- `POST /api/progress/practice-attempt` returns 404 for an unknown `pose_id`.

## What's already implemented

- User registration and login with JWT auth
- Pose and ReferenceAngle models matching `reference_angle_contract.json`
- Seed script and seed data
- Practice attempt and final test submission, with final test gated on program completion
- Progress status and history endpoints for the dashboard

## Not implemented yet

- [ ] Real reference angles for the 7 poses besides tadasana (Pose Analysis Lead)
- [ ] Alembic migrations (currently `Base.metadata.create_all`, fine early on but it won't apply schema changes to existing tables)
- [ ] Image/frame upload endpoint, only if camera processing ends up server-side
- [ ] Deployment config for the final demo

## Quick test flow (once running)

1. `POST /api/auth/register` — create a user
2. `POST /api/auth/login` — get an access token
3. Run the seed script, then use the token as a Bearer token to call `GET /api/poses` and `GET /api/progress/status`
