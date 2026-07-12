import { expect, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { BoardLocators } from '../locators';
import type { TicketState, TicketType } from '../../common/models';

export class BoardPage extends BasePage {
  readonly locators: BoardLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new BoardLocators(page);
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async selectTeam(teamName: string): Promise<void> {
    await this.locators.teamSelect.selectOption({ label: teamName });
    // Once a team is selected, the filters and "+ New ticket" link appear.
    await expect(this.locators.newTicketLink).toBeVisible();
  }

  async filterByType(type: TicketType): Promise<void> {
    await this.locators.typeSelect.selectOption(type);
  }

  async searchByTitle(text: string): Promise<void> {
    await this.locators.searchInput.fill(text);
  }

  async startNewTicket(): Promise<void> {
    await this.locators.newTicketLink.click();
  }

  /** Click a card to open it as a modal (does not drag). */
  async openTicket(title: string): Promise<void> {
    await this.locators.card(title).click();
  }

  async expectCardInColumn(state: TicketState, title: string): Promise<void> {
    await expect(this.locators.cardInColumn(state, title)).toBeVisible();
  }

  async expectCardVisible(title: string): Promise<void> {
    await expect(this.locators.card(title)).toBeVisible();
  }

  async expectCardHidden(title: string): Promise<void> {
    await expect(this.locators.card(title)).toBeHidden();
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.locators.emptyState).toBeVisible();
  }
}
