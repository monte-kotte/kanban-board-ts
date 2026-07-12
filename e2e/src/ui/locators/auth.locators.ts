import type { Locator, Page } from '@playwright/test';

/** Locators shared by the login and signup pages, plus their success/error states. */
export class AuthLocators {
  readonly heading: (name: 'Log in' | 'Sign up' | 'Account created') => Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly signupButton: Locator;
  readonly formError: Locator;
  readonly goToLoginLink: Locator;
  readonly signupLink: Locator;

  constructor(page: Page) {
    this.heading = (name) => page.getByRole('heading', { name, exact: true });
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: /^log(ging)? in/i });
    this.signupButton = page.getByRole('button', { name: /sign up|creating account/i });
    this.formError = page.locator('.form-error');
    this.goToLoginLink = page.getByRole('link', { name: 'Go to login' });
    this.signupLink = page.getByRole('link', { name: 'Sign up' });
  }
}
