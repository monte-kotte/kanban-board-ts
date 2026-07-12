import { test } from '../fixtures/test-fixtures';
import { UserBuilder } from '../../common/builders';

test.describe('Authentication', () => {
  test('signing up with an already-registered email shows an error', async ({
    authSteps,
    signupPage,
  }) => {
    const user = new UserBuilder().build();

    await test.step('Sign up with a new account', async () => {
      await authSteps.signUp(user);
    });

    await test.step('Sign up again with the same email', async () => {
      await signupPage.open();
      await signupPage.fillForm(user);
      await signupPage.submit();
      await signupPage.expectError();
    });
  });

  test('logging in with an incorrect password shows an error and does not redirect', async ({
    authSteps,
    loginPage,
  }) => {
    const user = new UserBuilder().build();

    await test.step('Sign up with a new account (without logging in)', async () => {
      await authSteps.signUp(user);
    });

    await test.step('Attempt to log in with the wrong password', async () => {
      await loginPage.open();
      await loginPage.fillForm({ ...user, password: 'wrong-password-123' });
      await loginPage.submit();
      await loginPage.expectError();
    });
  });
});
