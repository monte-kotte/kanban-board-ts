import { expect, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { TeamsLocators } from '../locators';
import { ROUTES } from '../constants';
import type { TeamModel } from '../../common/models';

export class TeamsPage extends BasePage {
  readonly locators: TeamsLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new TeamsLocators(page);
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.teams);
    await expect(this.locators.heading).toBeVisible();
  }

  async createTeam(team: TeamModel): Promise<void> {
    await this.locators.newTeamInput.fill(team.name);
    await this.locators.createButton.click();
  }

  async rename(currentName: string, newName: string): Promise<void> {
    await this.locators.renameButton(currentName).click();
    await this.locators.editInput(currentName).fill(newName);
    await this.locators.saveButton(currentName).click();
  }

  async delete(name: string): Promise<void> {
    await this.locators.deleteButton(name).click();
  }

  async expectTeamVisible(name: string): Promise<void> {
    await expect(this.locators.teamRow(name)).toBeVisible();
  }

  async expectTeamAbsent(name: string): Promise<void> {
    await expect(this.locators.teamRow(name)).toHaveCount(0);
  }

  async expectError(): Promise<void> {
    await expect(this.locators.formError).toBeVisible();
  }
}
