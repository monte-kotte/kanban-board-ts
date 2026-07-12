import { defineConfig, devices } from '@playwright/test';

/**
 * The stack is expected to be running (see repo README: `docker compose up --build`).
 * Override the base URL with E2E_BASE_URL when the frontend is served elsewhere.
 */
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'ui',
      testDir: './src/ui/tests',
      use: { ...devices['Desktop Chrome'], baseURL },
    },
    // Future API e2e suite — no browser, just the HTTP layer:
    // {
    //   name: 'api',
    //   testDir: './src/api/tests',
    //   use: { baseURL: process.env.E2E_API_URL ?? 'http://localhost:3000/api' },
    // },
  ],
});
