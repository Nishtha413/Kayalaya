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
    pose.py              → Pose, app-ID mapping, day, day-pose, and ReferenceAngle tables
    session.py            → PracticeAttempt + FinalTestResult tables
  schemas/
    auth.py               → request/response shapes for auth
    pose.py                → request/response shapes for poses + scoring submissions
  api/
    deps.py                 → get_current_user (JWT) dependency
    routes/
      auth.py                 → /api/auth/register, /api/auth/login
      poses.py                 → /api/poses, /api/poses/{id}
      program.py               → /api/program/days
      progress.py                → /api/progress/status, /practice-attempt, /final-test-result, /history
  seed/
    seed_data.json              → poses, ordered day sequences, reference angles (edit this, not the DB)
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

## Database Migrations (Alembic)

Schema management is handled by Alembic. When models change, generate and apply migrations:

```bash
cd backend

# Apply pending migrations
alembic upgrade head

# Generate a new migration after editing models
alembic revision --autogenerate -m "Add new columns or tables"

# Rollback one migration step
alembic downgrade -1
```

In Docker:
```bash
docker compose exec api alembic upgrade head
```

## Seeding pose data

After the API/database is up, load the poses, app-ID mappings, seven-day schedule, and reference angles:

```bash
python -m app.seed.seed            # local
docker compose exec api python -m app.seed.seed   # Docker
```

Safe to re-run. When the Pose Analysis/Scoring Lead updates angle ranges or the mobile
program sequence changes, edit `app/seed/seed_data.json` and re-run the seed. Only
`tadasana` has (provisional) angles so far.

## Day-unlock logic

- `GET /api/progress/status` returns per-day completion and `final_test_unlocked`.
- `GET /api/program/days` returns the ordered pose sequence and metadata for each day.
- Pose identifiers in the API are available as numeric database IDs and as the mobile app's `client_id` slugs (for example, `mountain`).
- A day is complete when the user has at least one practice attempt for every pose assigned to that specific day.
- The same pose may appear on multiple days; each occurrence is tracked independently.
- `POST /api/progress/final-test-result` returns 403 until all days are complete.
- `POST /api/progress/practice-attempt` returns 404 for an unknown `pose_id` and 422 if the pose is not assigned to the submitted day.

## Running Tests

Automated tests are built with `pytest` and execute against an isolated in-memory SQLite database without requiring a running PostgreSQL server or Docker container.

```bash
cd backend
pytest -v
```

The test suite covers:
- **Authentication**: Registration (success, duplicate emails, validation), password hashing, login, JWT token validity, and expired/tampered tokens.
- **Poses & Lookup**: Pose listing, reference angles, and lookup by numeric ID, mobile client slug (`mountain`), and Sanskrit name (`tadasana`).
- **7-Day Program**: Program day structures, metadata (theme/title/description), and ordered pose sequences.
- **Progress & Gating**: Final test lock enforcement (403), practice attempt validations (404 for unknown poses, 422 for unassigned poses), day completion, and progression unlock.

## What's already implemented

- User registration and login with JWT auth
- Pose and ReferenceAngle models matching `reference_angle_contract.json`
- Seed script and seed data
- Practice attempt and final test submission, with final test gated on program completion
- Progress status and history endpoints for the dashboard
- Automated pytest test suite (26 tests)
- Alembic migrations (`alembic upgrade head`)

## Not implemented yet

- [ ] Real reference angles for the 7 poses besides tadasana (Pose Analysis Lead)
- [ ] Image/frame upload endpoint, only if camera processing ends up server-side
- [ ] Deployment config for the final demo

## Quick test flow (once running)

1. `POST /api/auth/register` — create a user
2. `POST /api/auth/login` — get an access token
3. Run the seed script, then use the token as a Bearer token to call `GET /api/poses` and `GET /api/progress/status`
