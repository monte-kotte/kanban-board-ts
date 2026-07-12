# End-to-end tests (Playwright + POM)

End-to-end tests for the Kanban board: a browser (UI) suite and an HTTP (API)
suite, living side by side and sharing the same domain models and test-data
builders. The UI suite is a Page Object Model; the API suite is a thin client
layer over the REST endpoints. Both keep selectors/HTTP mechanics, behaviour,
and business flows in distinct layers.

## Layout

```
e2e/
├─ playwright.config.ts         # runner config; one Playwright project per suite
└─ src/
   ├─ common/                   # shared by every suite (UI + API)
   │  ├─ models/                # data shapes + domain constants (UserModel, TicketModel, …)
   │  ├─ builders/              # fluent test-data builders with unique defaults
   │  └─ utils/                 # generic helpers (e.g. unique-value generation)
   ├─ ui/                       # browser end-to-end suite (Page Object Model)
   │  ├─ constants/             # routes and other UI-suite-only constants
   │  ├─ locators/              # element selectors only — one class per page area
   │  ├─ pages/                 # page objects: actions + assertions using locators
   │  ├─ steps/                 # business flows composed from page objects
   │  ├─ fixtures/              # Playwright fixtures wiring pages + steps into `test`
   │  └─ tests/                 # the UI specs
   └─ api/                      # HTTP end-to-end suite (no browser)
      ├─ constants/             # HTTP status codes, sentinel values (e.g. a non-existent id)
      ├─ models/                # request/response contracts per endpoint (*.api-model.ts)
      ├─ clients/               # thin wrappers over APIRequestContext, one per resource
      ├─ builders/              # request builders that need a real id (epic/ticket need teamId)
      ├─ fixtures/              # Playwright fixtures wiring clients into `test`
      └─ tests/                 # the API specs
```

Within the UI suite, layer dependencies flow one way:
`tests → steps → pages → locators`. Within the API suite: `tests → clients →
models`. Both draw shared data from `common/models` and `common/builders`
(e.g. `UserBuilder`/`TeamBuilder`/`CommentBuilder` request bodies are
identical in the UI form and the API request, so both suites reuse them;
epic/ticket API requests need a real `teamId`/`epicId`, so those get their own
builders under `api/builders`).

Each suite is a separate Playwright **project** in `playwright.config.ts`
(`ui`, `api`), with its own base URL and (for `ui`) browser device, and can be
run independently: `npm test -- --project=ui` or `--project=api`.

The API suite talks straight to the backend and needs no browser, so it's
useful both as its own fast regression suite and to set up/verify state the
UI suite doesn't need to (e.g. asserting exact response shapes and status
codes for 401/404/409 paths).

## Prerequisites

The application stack must be running and reachable. From the repo root:

```
docker compose up --build
```

The frontend is expected at `http://localhost:5173` and the API at
`http://localhost:3000/api`. Point the tests elsewhere with the
`E2E_BASE_URL` / `E2E_API_URL` environment variables.

## Install

```
cd e2e
npm install
npx playwright install chromium
```

## Run

```
npm test                    # everything, headless
npm test -- --project=ui    # UI suite only
npm test -- --project=api   # API suite only
npm run test:headed         # headed browser (UI project)
npm run test:ui             # Playwright UI mode
npm run report              # open the last HTML report
```

## Notes

- Test data is generated with unique suffixes (see `src/common/utils/string.utils.ts`),
  so specs are safe to run repeatedly against a shared database and in parallel
  — no manual cleanup or DB reset required.
- The ticket create/edit form renders both as a full page and inside a modal.
  `TicketLocators` scopes every element to the `.ticket-page` container so it
  never collides with the board toolbar behind an open modal.
- The API `baseURL` (`http://localhost:3000/api`) is normalized to always end
  in `/`, and every client request path is relative (no leading `/`) — with a
  path segment in `baseURL`, a leading slash on the request path makes
  Playwright treat it as absolute and drop `/api` entirely.
- Every non-auth endpoint requires a session; API tests call
  `authClient.signupAndLogin(...)` first (see `AuthClient`).
- API specs assert plainly: `expect(result.status).toBe(HTTP_STATUS.X)` then
  `result.body as SomeResponse`. `HTTP_STATUS` (`api/constants/http-status.ts`)
  names the codes so it reads like the backend's own `HttpStatus.X` usage.
- `workers: 1` is set globally: the stack runs a single, non-scaled backend
  container, and bcrypt hashing on signup/login is CPU-heavy enough that
  concurrent requests from multiple workers start timing out.
- Business scenarios are catalogued in
  `../.kb/testing/2026-07-11-user-e2e-use-cases.md` (Gherkin), and the API
  suite's own scenario notes are in `../.kb/testing/2026-07-12-api-test-scenarios.md`.
