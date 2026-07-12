import type { Locator, Page } from '@playwright/test';

/**
 * Locators for the ticket create/edit form. The same form renders both as a
 * full page (`/tickets/:id`) and inside a modal on top of the board, so every
 * locator is scoped to the `.ticket-page` container to avoid colliding with the
 * board toolbar's identically-labelled Team/Type/Epic controls behind the modal.
 */
export class TicketLocators {
  readonly heading: Locator;
  readonly teamSelect: Locator;
  readonly epicSelect: Locator;
  readonly typeSelect: Locator;
  readonly stateSelect: Locator;
  readonly titleInput: Locator;
  readonly bodyTextarea: Locator;
  readonly saveButton: Locator;
  readonly closeButton: Locator;
  readonly deleteButton: Locator;
  readonly backToBoardLink: Locator;
  readonly formError: Locator;

  // Comments
  readonly commentInput: Locator;
  readonly commentSubmit: Locator;
  readonly commentItems: Locator;
  readonly noCommentsState: Locator;

  // Modal chrome (present only when opened as a modal)
  readonly modalBackdrop: Locator;
  readonly modalPanel: Locator;
  readonly modalCloseButton: Locator;

  constructor(page: Page) {
    const root = page.locator('.ticket-page');
    this.heading = root.getByRole('heading', { name: /New ticket|Edit ticket/ });
    this.teamSelect = root.getByLabel('Team');
    this.epicSelect = root.getByLabel('Epic');
    this.typeSelect = root.getByLabel('Type');
    this.stateSelect = root.getByLabel('State');
    this.titleInput = root.getByLabel('Title');
    this.bodyTextarea = root.getByLabel('Body');
    this.saveButton = root.getByRole('button', { name: /^Sav(e|ing)/ });
    this.closeButton = root.getByRole('button', { name: 'Close' });
    this.deleteButton = root.getByRole('button', { name: 'Delete' });
    this.backToBoardLink = root.getByRole('link', { name: /Back to board/ });
    this.formError = root.locator('.form-error');

    this.commentInput = root.getByPlaceholder('Add a comment');
    this.commentSubmit = root.getByRole('button', { name: 'Comment' });
    this.commentItems = root.locator('.comment-list li');
    this.noCommentsState = root.getByText('No comments yet.');

    this.modalBackdrop = page.locator('.modal-backdrop');
    this.modalPanel = page.locator('.modal-panel');
    this.modalCloseButton = page.locator('.modal-close-btn');
  }

  /** A comment list item matched by its body text. */
  comment(body: string): Locator {
    return this.commentItems.filter({ hasText: body });
  }
}
