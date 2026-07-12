import { expect, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { LayoutLocators } from '../locators';

/** The authenticated app shell: top navigation and the user menu. */
export class LayoutPage extends BasePage {
  readonly locators: LayoutLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new LayoutLocators(page);
  }

  async goToBoard(): Promise<void> {
    await this.locators.boardNav.click();
  }

  async goToTeams(): Promise<void> {
    await this.locators.teamsNav.click();
  }

  async goToEpics(): Promise<void> {
    await this.locators.epicsNav.click();
  }

  async logout(): Promise<void> {
    await this.locators.logoutButton.click();
  }

  async expectLoggedIn(email: string): Promise<void> {
    await expect(this.locators.userEmail).toHaveText(email);
    await expect(this.locators.logoutButton).toBeVisible();
  }
}
