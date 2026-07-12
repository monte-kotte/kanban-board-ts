import { test, expect } from '../fixtures/test-fixtures';
import { UserBuilder } from '../../common/builders';
import { HTTP_STATUS } from '../constants';
import type { LoginResponse, MeResponse, SignupResponse } from '../models';

test.describe('Auth API', () => {
  test('signup creates a user and never exposes the password or its hash', async ({ authClient }) => {
    const user = new UserBuilder().build();

    const result = await authClient.signup(user);

    expect(result.status).toBe(HTTP_STATUS.CREATED);
    const body = result.body as SignupResponse;
    expect(body.email).toBe(user.email);
    expect(body.id).toBeTruthy();
    expect(body).not.toHaveProperty('password');
    expect(body).not.toHaveProperty('passwordHash');
  });

  test('signup with an already-registered email returns 409', async ({ authClient }) => {
    const user = new UserBuilder().build();
    await authClient.signup(user);

    const result = await authClient.signup(user);

    expect(result.status).toBe(HTTP_STATUS.CONFLICT);
  });

  test('login with valid credentials sets a session that /auth/me reflects', async ({ authClient }) => {
    const user = new UserBuilder().build();
    await authClient.signup(user);

    const loginResult = await authClient.login(user);
    expect(loginResult.status).toBe(HTTP_STATUS.OK);
    expect((loginResult.body as LoginResponse).user.email).toBe(user.email);

    const meResult = await authClient.me();
    expect(meResult.status).toBe(HTTP_STATUS.OK);
    expect((meResult.body as MeResponse).email).toBe(user.email);
  });

  test('login with an incorrect password returns 401', async ({ authClient }) => {
    const user = new UserBuilder().build();
    await authClient.signup(user);

    const result = await authClient.login({ ...user, password: 'wrong-password-123' });

    expect(result.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  test('me without a session returns 401', async ({ authClient }) => {
    const result = await authClient.me();

    expect(result.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  test('logout clears the session so /auth/me becomes unauthorized again', async ({ authClient }) => {
    const user = new UserBuilder().build();
    await authClient.signupAndLogin(user);

    const logoutResult = await authClient.logout();
    expect(logoutResult.status).toBe(HTTP_STATUS.OK);

    const meResult = await authClient.me();
    expect(meResult.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });
});
