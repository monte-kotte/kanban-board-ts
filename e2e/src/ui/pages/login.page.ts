import { expect, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { AuthLocators } from '../locators';
import type { UserModel } from '../../common/models';

export class LoginPage extends BasePage {
  readonly locators: AuthLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new AuthLocators(page);
  }

  async open(): Promise<void> {
    await this.goto('/login');
    await expect(this.locators.heading('Log in')).toBeVisible();
  }

  async fillForm(user: UserModel): Promise<void> {
    await this.locators.emailInput.fill(user.email);
    await this.locators.passwordInput.fill(user.password);
  }

  async submit(): Promise<void> {
    await this.locators.loginButton.click();
  }

  async expectError(): Promise<void> {
    await expect(this.locators.formError).toBeVisible();
  }
}
