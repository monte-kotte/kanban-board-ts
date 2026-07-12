import type { LoginPage, SignupPage, LayoutPage } from '../pages';
import type { UserModel } from '../../common/models';

/** High-level authentication flows built from the auth page objects. */
export class AuthSteps {
  constructor(
    private readonly signupPage: SignupPage,
    private readonly loginPage: LoginPage,
    private readonly layout: LayoutPage,
  ) {}

  /** Register a brand-new account and confirm the success screen. */
  async signUp(user: UserModel): Promise<void> {
    await this.signupPage.open();
    await this.signupPage.fillForm(user);
    await this.signupPage.submit();
    await this.signupPage.expectSuccess();
  }

  /** Log in and confirm we land on the authenticated shell. */
  async login(user: UserModel): Promise<void> {
    await this.loginPage.open();
    await this.loginPage.fillForm(user);
    await this.loginPage.submit();
    await this.layout.expectLoggedIn(user.email);
  }

  /** Convenience: register then immediately log in. */
  async signUpAndLogin(user: UserModel): Promise<void> {
    await this.signUp(user);
    await this.login(user);
  }

  async logout(): Promise<void> {
    await this.layout.logout();
  }
}
