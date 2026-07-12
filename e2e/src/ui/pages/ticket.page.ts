import { expect, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { TicketLocators } from '../locators';
import type { TicketModel } from '../../common/models';

export class TicketPage extends BasePage {
  readonly locators: TicketLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new TicketLocators(page);
  }

  /** Fill the create/edit form. Only sets fields present on the model. */
  async fillForm(ticket: TicketModel): Promise<void> {
    if (ticket.teamName) {
      await this.locators.teamSelect.selectOption({ label: ticket.teamName });
    }
    if (ticket.epicTitle) {
      await this.locators.epicSelect.selectOption({ label: ticket.epicTitle });
    }
    await this.locators.typeSelect.selectOption(ticket.type);
    if (ticket.state) {
      await this.locators.stateSelect.selectOption(ticket.state);
    }
    await this.locators.titleInput.fill(ticket.title);
    await this.locators.bodyTextarea.fill(ticket.body);
  }

  async save(): Promise<void> {
    await this.locators.saveButton.click();
  }

  async setTitle(title: string): Promise<void> {
    await this.locators.titleInput.fill(title);
  }

  async close(): Promise<void> {
    await this.locators.closeButton.click();
  }

  async addComment(body: string): Promise<void> {
    await this.locators.commentInput.fill(body);
    await this.locators.commentSubmit.click();
  }

  async expectOpen(): Promise<void> {
    await expect(this.locators.heading).toBeVisible();
  }

  async expectComment(body: string): Promise<void> {
    await expect(this.locators.comment(body)).toBeVisible();
  }

  async expectNoComments(): Promise<void> {
    await expect(this.locators.noCommentsState).toBeVisible();
  }
}
