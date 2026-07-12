import type { Locator, Page } from '@playwright/test';

/** Locators for the authenticated app shell (top nav + user menu). */
export class LayoutLocators {
  readonly boardNav: Locator;
  readonly teamsNav: Locator;
  readonly epicsNav: Locator;
  readonly userEmail: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.boardNav = page.getByRole('link', { name: 'Board', exact: true });
    this.teamsNav = page.getByRole('link', { name: 'Teams', exact: true });
    this.epicsNav = page.getByRole('link', { name: 'Epics', exact: true });
    this.userEmail = page.locator('.app-user span');
    this.logoutButton = page.getByRole('button', { name: 'Log out' });
  }
}
