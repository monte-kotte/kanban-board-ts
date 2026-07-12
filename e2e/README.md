# End-to-end tests (Playwright + POM)

End-to-end tests for the Kanban board. Organised so browser (UI) and, later,
API suites live side by side and share the same domain models and test-data
builders. The UI suite is a Page Object Model with distinct layers so
selectors, page behaviour, and business flows stay decoupled.

## Layout

```
e2e/
├─ playwright.config.ts         # runner config; one Playwright project per suite
└─ src/
   ├─ common/                   # shared by every suite (UI + future API)
   │  ├─ models/                # data shapes + domain constants (UserModel, TicketModel, …)
   │  └─ builders/              # fluent test-data builders with unique defaults
   ├─ ui/                       # browser end-to-end suite (Page Object Model)
   │  ├─ locators/              # element selectors only — one class per page area
   │  ├─ pages/                 # page objects: actions + assertions using locators
   │  ├─ steps/                 # business flows composed from page objects
   │  ├─ fixtures/              # Playwright fixtures wiring pages + steps into `test`
   │  └─ tests/                 # the UI specs
   └─ api/                      # (future) API end-to-end suite — clients/steps/tests
```

Within the UI suite, layer dependencies flow one way:
`tests → steps → pages → locators`, with `common/models` and `common/builders`
supplying the data. A spec reads as a business scenario; the mechanics live in
the layer below it.

Each suite is a separate Playwright **project** in `playwright.config.ts`
(`ui` today, `api` later), so they can have different base URLs and browser
settings and be run independently: `npm test -- --project=ui`.

## Prerequisites

The application stack must be running and reachable. From the repo root:

```
docker compose up --build
```

The frontend is expected at `http://localhost:5173`. Point the tests elsewhere
with the `E2E_BASE_URL` environment variable.

## Install

```
cd e2e
npm install
npx playwright install chromium
```

## Run

```
npm test              # headless
npm run test:headed   # headed browser
npm run test:ui       # Playwright UI mode
npm run report        # open the last HTML report
```

## Notes

- Test data is generated with unique suffixes (see `src/builders/unique.ts`),
  so specs are safe to run repeatedly against a shared database and in parallel
  — no manual cleanup or DB reset required.
- The ticket create/edit form renders both as a full page and inside a modal.
  `TicketLocators` scopes every element to the `.ticket-page` container so it
  never collides with the board toolbar behind an open modal.
- Business scenarios are catalogued in
  `../.kb/testing/2026-07-11-user-e2e-use-cases.md` (Gherkin); this suite
  currently automates the core create-and-comment happy path.
```
