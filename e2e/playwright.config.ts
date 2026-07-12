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
  // The stack runs a single, non-scaled backend container; bcrypt hashing on
  // signup/login is CPU-heavy, so running many workers in parallel against it
  // causes real requests to time out. Keep this serial until the backend can
  // be scaled for test concurrency.
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
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
