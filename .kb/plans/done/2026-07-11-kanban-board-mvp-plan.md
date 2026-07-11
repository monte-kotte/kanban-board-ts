# Kanban Board MVP Plan

Date: 2026-07-11
Status: implemented (see README.md at repo root)

Source spec: hackathon "Ticketing System" task (see conversation). This plan
is a **deliberately simplified** version of that spec — deviations from the
original requirements are called out explicitly so they aren't mistaken for
oversights.

## Deviations from the original spec (agreed with user)

| Area | Spec says | This plan does | Why |
|---|---|---|---|
| Email verification | SMTP via relay1.dataart.com, 24h single-use token, resend flow, verification-result screen | **Dropped.** Accounts are active immediately after signup, straight to login. | User explicitly wants to skip verification/SMTP complexity for a working app now. |
| Password hashing | Argon2id | **bcrypt** (bcryptjs/bcrypt npm package) | Still hashes properly (never plaintext), far less setup than Argon2id tuning. |
| Session/auth transport | Cookie or bearer, either acceptable | **JWT in httpOnly cookie** | No token handling in frontend JS; simplest secure default; avoids XSS token theft. |

Everything else in the original spec (teams, epics, tickets, comments, 5-state
board, drag-and-drop persistence, filters, 409 on referential conflicts,
migrations-only fresh DB) is kept as mandatory scope.

## Minimum screens (revised)

Because email verification is dropped, the screen list shrinks to:
1. Sign-up
2. Login
3. Kanban board with team selector
4. Ticket create/edit/detail view
5. Team management
6. Epic management

(No email-verification-result or resend screens.)

## Architecture

Three containers via root `docker compose up --build`:
- `db` — Postgres 16 (already scaffolded in `docker-compose.yml`)
- `backend` — NestJS API (Node/TS), talks to Postgres
- `frontend` — Vite + React SPA, built to static assets and served (e.g. nginx), talks only to the backend HTTP API

Clear tier separation: frontend never touches the DB; backend is the only
writer; DB has no direct client exposure beyond the backend (dev port mapping
for local psql access is fine, not used by the app itself).

## Backend (NestJS)

- ORM/migrations: **Prisma** — `prisma migrate deploy` runs automatically on
  backend container start (entrypoint script), giving the "fresh DB has
  schema + migration metadata only, no seed data" requirement for free.
- Modules: `auth`, `teams`, `epics`, `tickets`, `comments`.
- Global auth guard on all routes except `POST /auth/signup`, `POST
  /auth/login`, and a health endpoint.

### Entities
- **User**: id, email (unique, case-insensitive — citext or `lower(email)` unique index), passwordHash, createdAt
- **Team**: id, name (unique case-insensitive, non-empty trimmed), createdAt, updatedAt
- **Epic**: id, teamId (FK, immutable after create), title (non-empty trimmed), description?, createdAt, updatedAt
- **Ticket**: id, teamId (FK), epicId? (FK, nullable), type (`bug|feature|fix`), state (5-value enum), title, body, createdById (FK), createdAt, updatedAt
- **Comment**: id, ticketId (FK), authorId (FK), body (non-empty), createdAt

### Referential integrity
- FK `ON DELETE RESTRICT` from tickets/epics → team, tickets → epic. Service
  layer pre-checks (for a clean error message) plus DB constraint as backstop;
  translate FK violation → HTTP 409.
- Ticket create/update: reject if `epicId` references an epic whose `teamId`
  differs from the ticket's `teamId` (service-level check, not just UI).
- Enum validation server-side (class-validator DTOs) regardless of client input.
- `modifiedAt` bump logic: only on actual field/state change (compare before
  save), never on comment add, never on no-op save.

### Key endpoints
- `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET/POST/PATCH/DELETE /teams`
- `GET/POST/PATCH/DELETE /epics` (filter by team)
- `GET/POST/PATCH/DELETE /tickets` (filter by team + type + epic + title substring, case-insensitive)
- `PATCH /tickets/:id` handles state changes too (drag-and-drop uses this), persisted immediately
- `GET/POST /tickets/:id/comments` (chronological, oldest first)

## Frontend (Vite + React + TS)

- **react-query** (TanStack Query) for server state/caching, **react-router**
  for routes.
- **dnd-kit** for the Kanban drag-and-drop (actively maintained, unlike
  react-beautiful-dnd).
- Optimistic move on drag: update UI immediately, roll back to previous
  column + show error toast if the PATCH fails (per spec requirement).
- Board: 5 fixed columns in workflow order, cards sorted by `modifiedAt` desc
  within a column, filters (type/epic/title substring) combined with AND,
  client-side is fine given ~100-ticket scale.
- No Redux — react-query + local component state is enough for this scope.

## Testing

- **Backend**: Jest + supertest integration test(s) against a real test
  Postgres — at least one full business flow, e.g. create team → create epic
  → create ticket → drag/state-change → delete epic blocked (409) → delete
  ticket → delete epic succeeds.
- **Frontend**: Vitest + React Testing Library — at least one flow, e.g.
  login → board loads → drag a card → column membership updates.

## Docker Compose additions needed

Extend the existing `docker-compose.yml` (currently only `db`) with `backend`
and `frontend` services, `depends_on: db` with healthcheck condition, and
env vars: `DATABASE_URL`, `JWT_SECRET`, `PORT`. Extend `.env.example`
accordingly (no real secrets committed).

## Open items for later

- Prisma vs TypeORM was picked (Prisma) for migration ergonomics — revisit
  only if a strong reason comes up.
- README must document the three deviations above clearly so they read as
  intentional simplifications, not spec misses.
