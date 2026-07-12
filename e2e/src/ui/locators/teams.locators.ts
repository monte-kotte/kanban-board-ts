import type { Locator, Page } from '@playwright/test';

/** Locators for the Teams management page (`/teams`). */
export class TeamsLocators {
  private readonly page: Page;
  readonly heading: Locator;
  readonly newTeamInput: Locator;
  readonly createButton: Locator;
  readonly formError: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Teams', exact: true });
    this.newTeamInput = page.getByPlaceholder('New team name');
    this.createButton = page.getByRole('button', { name: 'Create team' });
    this.formError = page.locator('.form-error');
    this.emptyState = page.getByText('No teams yet. Create one above.');
  }

  /** The list row for a team, matched by its displayed name. */
  teamRow(name: string): Locator {
    return this.page.locator('.entity-list li').filter({ hasText: name });
  }

  renameButton(name: string): Locator {
    return this.teamRow(name).getByRole('button', { name: 'Rename' });
  }

  deleteButton(name: string): Locator {
    return this.teamRow(name).getByRole('button', { name: 'Delete' });
  }

  editInput(name: string): Locator {
    return this.teamRow(name).getByRole('textbox');
  }

  saveButton(name: string): Locator {
    return this.teamRow(name).getByRole('button', { name: 'Save' });
  }

  cancelButton(name: string): Locator {
    return this.teamRow(name).getByRole('button', { name: 'Cancel' });
  }
}
