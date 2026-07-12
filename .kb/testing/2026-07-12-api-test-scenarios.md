# API E2E Test Scenarios (Playwright)

Date: 2026-07-12
Status: reference — describes the automated Playwright API suite at
`e2e/src/api/`, which drives the backend's REST endpoints directly (no
browser) via `APIRequestContext`. Complements
`.kb/testing/2026-07-11-user-e2e-use-cases.md` (UI Gherkin scenarios) and the
Jest e2e suite at `backend/test/app.e2e-spec.ts`; this suite exists to assert
exact response shapes and status codes (401/404/409) cheaply and quickly,
without going through the browser.

Structure: `e2e/src/api/{models,clients,builders,fixtures,tests}` — see
`e2e/README.md` for the full layout and conventions. One Playwright project
(`api`) in `e2e/playwright.config.ts`, run via `npm test -- --project=api`
from `e2e/`.

Every non-auth endpoint requires a session (only `/auth/signup`,
`/auth/login`, and `/health` are `@Public()`), so nearly every test starts
with `authClient.signupAndLogin(user)`.

## Covered scenarios

```gherkin
Feature: Auth API

  Scenario: Signup creates a user and never exposes the password
    When I POST /auth/signup with a new email and password
    Then the response is 201
    And the body contains id and email only (no password or passwordHash)

  Scenario: Signup with an already-registered email
    Given an account already exists for that email
    When I POST /auth/signup again with the same email
    Then the response is 409

  Scenario: Login with valid credentials
    Given an account exists
    When I POST /auth/login with the correct email and password
    Then the response is 200 with { user: { id, email } }
    And a subsequent GET /auth/me (same session) returns the same email

  Scenario: Login with an incorrect password
    When I POST /auth/login with a wrong password
    Then the response is 401

  Scenario: Unauthenticated access
    When I GET /auth/me without a session
    Then the response is 401

  Scenario: Logout clears the session
    Given I am logged in
    When I POST /auth/logout
    Then the response is 200
    And a subsequent GET /auth/me returns 401
```

```gherkin
Feature: Teams API

  Scenario: Create a team
    When I POST /teams with a new name
    Then the response is 201 with the created team

  Scenario: Team names are unique, case-insensitively
    Given a team exists
    When I POST /teams with the same name in a different case
    Then the response is 409

  Scenario: Rename a team
    Given a team exists
    When I PATCH /teams/:id with a new name
    Then the response is 200 with the updated name

  Scenario: Delete a team with no epics or tickets
    Given a team with no epics or tickets exists
    When I DELETE /teams/:id
    Then the response is 204
    And a subsequent GET /teams/:id returns 404

  Scenario: Cannot delete a team that has an epic
    Given a team has an epic
    When I DELETE /teams/:id
    Then the response is 409
```

```gherkin
Feature: Epics API

  Scenario: Create an epic under a team
    Given a team exists
    When I POST /epics with that team's id and a title
    Then the response is 201 with teamId matching

  Scenario: Create an epic for a non-existent team
    When I POST /epics with a random team id
    Then the response is 404

  Scenario: List epics scoped to a team
    Given epics exist for multiple teams
    When I GET /epics?teamId=<id>
    Then only that team's epics are returned

  Scenario: Cannot delete an epic that has a ticket
    Given an epic has a ticket
    When I DELETE /epics/:id
    Then the response is 409
```

```gherkin
Feature: Tickets API

  Scenario: Create a ticket
    Given a team exists
    When I POST /tickets with type, title, and body
    Then the response is 201
    And it includes createdBy { id, email } and epic (null if none given)
    And state defaults to "new"

  Scenario: Filter tickets by type
    Given tickets of multiple types exist for a team
    When I GET /tickets?teamId=<id>&type=bug
    Then only bug tickets for that team are returned

  Scenario: Updating a ticket bumps updatedAt only on real change
    Given a ticket exists
    When I PATCH /tickets/:id with a different state
    Then the response is 200 with the new state
    And updatedAt has moved forward

  Scenario: Saving without changes does not bump updatedAt
    Given a ticket exists
    When I PATCH /tickets/:id with its own current title (no actual change)
    Then updatedAt is unchanged

  Scenario: Create a ticket for a non-existent team
    When I POST /tickets with a random team id
    Then the response is 404
```

```gherkin
Feature: Comments API

  Scenario: Add a comment and list it
    Given a ticket exists
    When I POST /tickets/:id/comments with a body
    Then the response is 201 with author { id, email }
    And a subsequent GET /tickets/:id/comments includes it

  Scenario: Adding a comment does not bump the ticket's updatedAt
    Given a ticket exists
    When I add a comment to it
    Then re-fetching the ticket shows the same updatedAt

  Scenario: Comment on a non-existent ticket
    When I POST /tickets/:id/comments with a random ticket id
    Then the response is 404
```

```gherkin
Feature: Referential integrity (API)

  Scenario: Deletions are blocked while referenced, then succeed in order
    Given a team has an epic, and that epic has a ticket
    When I DELETE the epic
    Then the response is 409
    When I DELETE the team
    Then the response is 409
    When I DELETE the ticket, then the epic, then the team
    Then each deletion responds 204
```

## Gotchas worth remembering

- **`baseURL` + leading slash**: Playwright resolves a relative request path
  (`this.request.post('auth/signup', ...)`) against `baseURL` using standard
  URL rules. If `baseURL` doesn't end in `/`, its last path segment is
  dropped; if the request path starts with `/`, it's treated as
  absolute-from-origin and `baseURL`'s path is dropped entirely. Fix: `baseURL`
  always ends in `/` (`http://localhost:3000/api/`) and every client path is
  relative with no leading slash (`'teams'`, not `'/teams'`).
- **Backend concurrency**: the local stack runs one backend container;
  bcrypt hashing makes signup/login CPU-heavy enough that many parallel
  workers cause real request timeouts (confirmed: 6 workers → 6/7 UI tests
  failed; serial → all passed in ~4-5s each). `playwright.config.ts` pins
  `workers: 1` globally for this reason — applies to both the `ui` and `api`
  projects.
