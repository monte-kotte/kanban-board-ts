import type { APIResponse } from '@playwright/test';
import type { ApiErrorBody, ApiResult } from '../models';

/**
 * Parses a Playwright API response into a typed {@link ApiResult}. Non-JSON
 * bodies (e.g. a 204 No Content on delete) resolve to `undefined`, mirroring
 * how the real frontend client (`frontend/src/api/client.ts`) treats them.
 */
export async function toApiResult<T>(response: APIResponse): Promise<ApiResult<T>> {
  const contentType = response.headers()['content-type'] ?? '';
  const body = contentType.includes('application/json')
    ? ((await response.json()) as T | ApiErrorBody)
    : undefined;
  return { status: response.status(), body };
}
