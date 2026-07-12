import { expect, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { AuthLocators } from '../locators';
import { ROUTES } from '../constants';
import type { UserModel } from '../../common/models';

export class SignupPage extends BasePage {
  readonly locators: AuthLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new AuthLocators(page);
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.signup);
    await expect(this.locators.heading('Sign up')).toBeVisible();
  }

  async fillForm(user: UserModel): Promise<void> {
    await this.locators.emailInput.fill(user.email);
    await this.locators.passwordInput.fill(user.password);
  }

  async submit(): Promise<void> {
    await this.locators.signupButton.click();
  }

  async expectSuccess(): Promise<void> {
    await expect(this.locators.heading('Account created')).toBeVisible();
    await expect(this.locators.goToLoginLink).toBeVisible();
  }

  async expectError(): Promise<void> {
    await expect(this.locators.formError).toBeVisible();
  }
}
