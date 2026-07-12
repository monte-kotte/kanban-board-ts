import type { Locator, Page } from '@playwright/test';
import { TICKET_STATE_LABELS, type TicketState } from '../../common/models';

/** Locators for the Kanban board page (`/`). */
export class BoardLocators {
  private readonly page: Page;
  readonly teamSelect: Locator;
  readonly typeSelect: Locator;
  readonly epicSelect: Locator;
  readonly searchInput: Locator;
  readonly newTicketLink: Locator;
  readonly emptyState: Locator;
  readonly dragError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.teamSelect = page.getByLabel('Team');
    this.typeSelect = page.getByLabel('Type');
    this.epicSelect = page.getByLabel('Epic');
    this.searchInput = page.getByLabel('Search');
    this.newTicketLink = page.getByRole('link', { name: '+ New ticket' });
    this.emptyState = page.getByText('Select a team to see its board.');
    this.dragError = page.locator('.board-page > .form-error');
  }

  /** A board column, located by its heading label. */
  column(state: TicketState): Locator {
    return this.page.locator('.board-column').filter({
      has: this.page.getByRole('heading', { name: TICKET_STATE_LABELS[state] }),
    });
  }

  /** Any card on the board matched by its title text. */
  card(title: string): Locator {
    return this.page.locator('.ticket-card').filter({ hasText: title });
  }

  /** A card matched by title, scoped to a single column. */
  cardInColumn(state: TicketState, title: string): Locator {
    return this.column(state).locator('.ticket-card').filter({ hasText: title });
  }
}
