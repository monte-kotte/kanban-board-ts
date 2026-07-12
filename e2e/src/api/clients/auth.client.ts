import type { APIRequestContext } from '@playwright/test';
import { toApiResult } from './base.client';
import type {
  ApiResult,
  LoginRequest,
  LoginResponse,
  MeResponse,
  SignupRequest,
  SignupResponse,
} from '../models';

export class AuthClient {
  constructor(private readonly request: APIRequestContext) {}

  async signup(body: SignupRequest): Promise<ApiResult<SignupResponse>> {
    const response = await this.request.post('auth/signup', { data: body });
    return toApiResult<SignupResponse>(response);
  }

  async login(body: LoginRequest): Promise<ApiResult<LoginResponse>> {
    const response = await this.request.post('auth/login', { data: body });
    return toApiResult<LoginResponse>(response);
  }

  async logout(): Promise<ApiResult<{ success: boolean }>> {
    const response = await this.request.post('auth/logout');
    return toApiResult<{ success: boolean }>(response);
  }

  async me(): Promise<ApiResult<MeResponse>> {
    const response = await this.request.get('auth/me');
    return toApiResult<MeResponse>(response);
  }

  /** Convenience: register then log in, leaving the request context's session cookie set. */
  async signupAndLogin(credentials: SignupRequest): Promise<ApiResult<LoginResponse>> {
    await this.signup(credentials);
    return this.login(credentials);
  }
}
