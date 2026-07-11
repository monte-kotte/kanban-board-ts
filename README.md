# Kanban Board

A small ticket tracker: teams, epics, tickets, comments, and a draggable
Kanban board. Three-tier SPA (React) + API (NestJS) + RDBMS (PostgreSQL).

## Known deviations from the original spec

This is a deliberately simplified build. See
[`.kb/plans/done/2026-07-11-kanban-board-mvp-plan.md`](.kb/plans/done/2026-07-11-kanban-board-mvp-plan.md)
for the full rationale. In short:

- **No email verification / SMTP.** Accounts are active immediately after
  sign-up — no verification link, no resend flow, no verification-result
  screen.
- **bcrypt instead of Argon2id** for password hashing.
- **JWT in an httpOnly cookie** for the session (rather than a bearer token).

Everything else — teams, epics, tickets, comments, the 5-column board with
drag-and-drop persistence, filters, referential-integrity 409s, and
migration-only fresh databases — is implemented as specified.

## Prerequisites

- Docker Desktop (or a compatible engine, e.g. Podman with `docker-compose`)
  with Compose support. Nothing else needs to be installed on the host.

## Configuration

Copy the example env file and adjust if needed (defaults work out of the box):

```
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Postgres credentials/database name |
| `POSTGRES_PORT` | Host port Postgres is published on (default `5432`) |
| `JWT_SECRET` | Secret used to sign session JWTs — change this for anything beyond local use |
| `BACKEND_PORT` | Host port the API is published on (default `3000`) |
| `FRONTEND_PORT` | Host port the web app is published on (default `5173`) |
| `FRONTEND_ORIGIN` | Origin the backend allows via CORS (must match where the frontend is served) |
| `VITE_API_URL` | Base API URL baked into the frontend build (must be reachable from the browser) |

No real secrets are committed; `.env` is gitignored.

## Running the app

From the repository root:

```
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api (health check at `/api/health`)

A fresh database contains no users, teams, epics, tickets, or comments —
schema is created via Prisma migrations only. Create your first account
from the sign-up screen, then log in.

To stop: `docker compose down`. To also wipe the database: `docker compose down -v`.

## Architecture

- **Frontend** (`/frontend`): Vite + React + TypeScript, TanStack Query for
  server state, react-router for routing, dnd-kit for the Kanban
  drag-and-drop. Built to static assets and served by nginx in its own
  container.
- **Backend** (`/backend`): NestJS + TypeScript, Prisma ORM against
  PostgreSQL. JWT auth via an httpOnly cookie, bcrypt password hashing,
  global validation and a Prisma-error-to-HTTP-status exception filter
  (unique violations / FK restrictions -> 409, missing records -> 404).
- **Database**: PostgreSQL 16, schema managed entirely through Prisma
  migrations (`backend/prisma/migrations`), applied automatically on
  container startup.

Each tier runs in its own container; the frontend only ever talks to the
backend's HTTP API, and only the backend talks to the database.

## Tests

Backend — an end-to-end test covering a full business flow (sign-up/login,
team/epic/ticket/comment creation, the 409 conflicts on deleting a
referenced team/epic, and the modifiedAt-only-changes-on-real-change rule)
against a real Postgres instance:

```
cd backend
docker compose -f ../docker-compose.yml up -d db   # or otherwise have Postgres reachable
npm install
npm run test:e2e
```

Frontend — a component test covering the team creation flow:

```
cd frontend
npm install
npm run test
```

## Local development without Docker (optional)

Requires Node.js 22+ and a reachable PostgreSQL instance.

```
# Terminal 1 — database only
docker compose up -d db

# Terminal 2 — backend
cd backend
npm install
npx prisma migrate deploy
npm run start:dev

# Terminal 3 — frontend
cd frontend
npm install
npm run dev
```

Backend reads its config from `backend/.env` (`DATABASE_URL`, `JWT_SECRET`,
`PORT`). Frontend reads `frontend/.env` (`VITE_API_URL`).
