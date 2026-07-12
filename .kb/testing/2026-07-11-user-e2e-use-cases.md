# User E2E Use Cases (Gherkin)

Date: 2026-07-11
Status: reference — manual/exploratory test script for the deployed app,
written in Gherkin (Given/When/Then) for clarity and potential later
automation (e.g. Playwright + cucumber). Complements the automated Jest
e2e suite at `backend/test/app.e2e-spec.ts`, which covers the same
business rules at the API level.

UI automation: a Playwright Page Object Model suite lives in `e2e/`. Shared
domain models/builders sit under `e2e/src/common/`, and the browser suite
(locators / pages / steps / fixtures / tests) under `e2e/src/ui/`, leaving room
for a future `e2e/src/api/` suite (each is its own Playwright project). See
`e2e/README.md`. It currently automates:
- the core happy path — sign up, log in, create a team, create a ticket, and
  comment on it (`ticket-lifecycle.spec.ts`)
- duplicate-email signup and wrong-password login errors (`auth.spec.ts`)
- case-insensitive team-name conflicts (`teams-management.spec.ts`)
- closing the ticket edit form without saving discards changes
  (`ticket-editing.spec.ts`)
- whitespace-only comments are rejected (`comments.spec.ts`)
- filtering the board by ticket type (`board-filters.spec.ts`)

Note: the local stack runs a single, non-scaled backend container, so the
Playwright config pins `workers: 1` — parallel signups/logins overload bcrypt
hashing on a single container and cause spurious failures (verified: 6/7
failed at high parallelism, all passed serially, ~4-5s each).
The remaining scenarios below are still to be automated.

Scope: user-facing flows through the browser at `http://localhost:5173`
against the containerized stack (`docker compose up --build`).

```gherkin
Feature: Authentication

  Scenario: Sign up with a new account
    Given I am on the "/signup" page
    When I enter a new email and a password of 8 or more characters
    And I submit the sign-up form
    Then I see the "Account created" screen
    And I see a link to log in
    And no email verification step is required

  Scenario: Sign up with an email that is already registered
    Given an account already exists for "user@example.com"
    And I am on the "/signup" page
    When I sign up again with "user@example.com"
    Then I see an error message on the form
    And no new account is created

  Scenario: Sign up with a password shorter than 8 characters
    Given I am on the "/signup" page
    When I enter a password shorter than 8 characters
    Then the form is blocked from submitting by client-side validation

  Scenario: Log in with valid credentials
    Given I have an active account
    And I am on the "/login" page
    When I enter my correct email and password
    And I submit the login form
    Then I am redirected to the board at "/"

  Scenario: Log in with an unknown email or wrong password
    Given I am on the "/login" page
    When I enter an unknown email or an incorrect password
    And I submit the login form
    Then I see an error message on the form
    And I am not redirected

  Scenario: Session persists across a page refresh
    Given I am logged in and on the board
    When I refresh the page
    Then I remain logged in
    And I am still on the board, not redirected to "/login"

  Scenario Outline: Protected routes require authentication
    Given I am logged out
    When I navigate directly to "<route>"
    Then I am redirected to "/login"

    Examples:
      | route        |
      | /            |
      | /teams       |
      | /epics       |
      | /tickets/new |

  Scenario Outline: Public-only routes redirect authenticated users
    Given I am logged in
    When I navigate directly to "<route>"
    Then I am redirected to "/"

    Examples:
      | route   |
      | /login  |
      | /signup |

  Scenario: Log out
    Given I am logged in
    When I click "Log out" in the header
    Then I am redirected to "/login"
    And navigating to "/" afterward redirects me back to "/login"
```

```gherkin
Feature: Teams management ("/teams")

  Scenario: Create a team
    Given I am on the "/teams" page
    When I enter a new team name
    And I submit the create-team form
    Then the new team appears in the list immediately

  Scenario: Team names are unique, case-insensitively
    Given a team named "Platform" already exists
    When I try to create a team named "platform"
    Then I see a conflict error message
    And no duplicate team is created

  Scenario: Rename a team
    Given a team exists
    When I click "Rename", change its name, and click "Save"
    Then the updated name appears in the list

  Scenario: Cancel renaming a team
    Given a team exists
    When I click "Rename", change the text, and click "Cancel"
    Then the original name remains unchanged

  Scenario: Delete a team with no epics or tickets
    Given a team with no epics or tickets exists
    When I delete it
    Then it disappears from the list

  Scenario: Cannot delete a team that has epics or tickets
    Given a team has at least one epic or ticket
    When I try to delete that team
    Then I see a conflict error message
    And the team remains in the list
```

```gherkin
Feature: Epics management ("/epics")

  Scenario: No team selected
    Given I am on the "/epics" page
    And no team is selected
    Then I see "Select a team to manage its epics"
    And no create-epic form is shown

  Scenario: Create an epic
    Given I am on the "/epics" page with a team selected
    When I enter a title, optionally a description, and submit
    Then the new epic appears in that team's epic list

  Scenario: Epic list is scoped to the selected team
    Given epics exist for multiple teams
    When I switch the team dropdown
    Then the epic list reloads to show only the newly selected team's epics

  Scenario: Edit an epic
    Given an epic exists
    When I click "Edit", change its title or description, and click "Save"
    Then the updated values are displayed

  Scenario: Cancel editing an epic
    Given an epic exists
    When I click "Edit", change values, and click "Cancel"
    Then the original values remain

  Scenario: Delete an epic with no tickets
    Given an epic with no tickets exists
    When I delete it
    Then it disappears from the list

  Scenario: Cannot delete an epic that has tickets
    Given an epic has at least one ticket
    When I try to delete that epic
    Then I see a conflict error message
    And the epic remains in the list
```

```gherkin
Feature: Kanban board ("/")

  Scenario: No team selected
    Given I am on the board with no team selected
    Then I see "Select a team to see its board"
    And no columns or filters are shown

  Scenario: Select a team shows its board
    Given I select a team on the board
    Then I see 5 columns: New, Ready for Implementation, In Progress,
      Ready for Acceptance, Done
    And only that team's tickets are shown

  Scenario: Filter by ticket type
    Given a team's board is loaded with tickets of multiple types
    When I choose a type from the Type filter
    Then only cards matching that type remain visible in every column

  Scenario: Filter by epic
    Given a team's board is loaded with tickets across multiple epics
    When I choose an epic from the Epic filter
    Then only tickets linked to that epic remain visible

  Scenario: Filter by title search
    Given a team's board is loaded
    When I type a substring of a ticket's title into the Search field
    Then only cards whose title contains that substring (case-insensitive)
      remain visible

  Scenario: Combined filters use AND semantics
    Given a team's board is loaded
    When I set a type, an epic, and a search term at the same time
    Then only cards matching all three conditions remain visible

  Scenario: Filters persist via the URL
    Given I have applied team, type, epic, and search filters
    When I copy the current URL and open it in a new tab
    Then the same team and filters are pre-selected
```

```gherkin
Feature: Ticket create, view, edit, close

  Scenario: Create a ticket and return to the board
    Given I am on the board with a team selected
    When I click "+ New ticket"
    And I fill in epic (optional), type, title, and body
    And I submit the form
    Then I am taken back to the board for that team
    And the new card is visible in the "New" column
    And I am not left on the ticket edit form

  Scenario: Create a ticket with missing required fields
    Given I am on the "new ticket" form
    When I leave the title or body empty
    And I try to submit
    Then the form is blocked from submitting by client-side validation

  Scenario: Open a ticket by clicking its card opens it as a modal
    Given a ticket card is visible on the board
    When I click the card without dragging it
    Then the ticket's edit form opens as a modal on top of the board
    And the form is pre-filled with that ticket's data
    And the board remains visible (dimmed) behind the modal

  Scenario: Opening a ticket directly by URL shows it as a full page
    Given I navigate directly to "/tickets/:id" (e.g. a bookmark or refresh)
    Then the edit form opens as a normal full page, not a modal
    And I see a "← Back to board" link at the top of the page

  Scenario: Saving an edited ticket saves and closes
    Given I have a ticket open in the edit form (modal or full page)
    When I change its title, body, type, epic, or state
    And I click "Save"
    Then the changes are persisted
    And the form closes (the modal closes, or the full page returns to the
      board, filtered to the ticket's team)
    And the ticket reflects the new values and an updated "Modified"
      timestamp when reopened

  Scenario: Saving without changes does not bump the modified time
    Given I have a ticket open in the edit form
    When I click "Save" without changing any field
    Then the form closes as usual
    And reopening the ticket shows its "Modified" timestamp unchanged

  Scenario: Changing state from the edit form moves the ticket on the board
    Given I have a ticket open in the edit form
    When I change the State dropdown and click "Save"
    Then I am returned to the board
    And the ticket appears in the column matching the new state

  Scenario: Close the edit form without saving
    Given I have a ticket open in the edit form
    When I click "Close" (or the "×" button, or press Escape, or click
      outside the modal)
    Then I am taken back to the board without saving any changes

  Scenario: Back-to-board link (full-page mode only)
    Given I opened a ticket directly by URL (full-page mode, not modal)
    When I click "← Back to board" at the top of the page
    Then I am taken back to the board, filtered to the ticket's team

  Scenario: Delete a ticket
    Given I have a ticket open in the edit form
    When I click "Delete"
    And I confirm the browser prompt
    Then I am taken back to the board
    And the ticket's card is gone

  Scenario: Cancel deleting a ticket
    Given I have a ticket open in the edit form
    When I click "Delete"
    And I dismiss the browser confirm prompt
    Then I remain on the edit form
    And the ticket is unchanged
```

```gherkin
Feature: Drag-and-drop on the board

  Scenario: Drag a card to another column
    Given a ticket card is visible on the board
    When I press and drag it to a different column
    And I release it there
    Then the card moves to that column immediately
    And it remains there after refreshing the page

  Scenario: A failed move rolls back
    Given a ticket card is visible on the board
    When I drag it to another column
    And the server rejects the update
    Then the card snaps back to its original column
    And an error message appears above the board

  Scenario: Clicking a card without moving the pointer opens it
    Given a ticket card is visible on the board
    When I click the card without moving the pointer
    Then the ticket's edit form opens as a modal (does not start a drag)

  Scenario: A small pointer movement still registers as a click
    Given a ticket card is visible on the board
    When I press on the card and move the pointer only a couple of pixels
      before releasing
    Then the ticket's edit form opens as a modal
    And no drag is started
```

```gherkin
Feature: Comments on a ticket

  Scenario: Add a comment
    Given I have an existing ticket open in the edit form
    When I type text into the comment box and submit
    Then the comment appears at the bottom of the comment list
    And it shows my email and a timestamp

  Scenario: Adding a comment does not bump the ticket's modified time
    Given I have an existing ticket open in the edit form
    And I note its current "Modified" timestamp
    When I add a comment
    Then the "Modified" timestamp stays the same

  Scenario: Cannot submit an empty comment
    Given I have an existing ticket open in the edit form
    When I submit the comment box while it is empty or whitespace-only
    Then no comment is added

  Scenario: No comments yet
    Given I open a ticket that has no comments
    Then I see "No comments yet."
```

```gherkin
Feature: Referential integrity across teams, epics, and tickets

  Scenario: Deletions are blocked while referenced, then succeed in order
    Given a team has an epic
    And that epic has a ticket
    When I try to delete the epic
    Then I see a conflict error and the epic remains
    When I try to delete the team
    Then I see a conflict error and the team remains
    When I delete the ticket
    And then delete the epic
    And then delete the team
    Then each deletion succeeds

  Scenario: A fresh database has no pre-existing data
    Given the stack was started with "docker compose down -v" followed by
      "docker compose up --build"
    When I open the app for the first time
    Then the sign-up screen is the only usable entry point
    And there are no pre-existing users, teams, epics, or tickets
```
