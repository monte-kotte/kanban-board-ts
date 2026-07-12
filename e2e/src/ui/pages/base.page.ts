import type { Page } from '@playwright/test';

/** Common behaviour shared by all page objects. */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Navigate to a path relative to the configured baseURL. */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }
}
