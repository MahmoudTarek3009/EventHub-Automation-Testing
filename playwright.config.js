// @ts-check
import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

// Playwright does not read .env itself. A value set there overrides the default below.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const baseUrl = process.env.BASE_URL || 'https://eventhub.rahulshettyacademy.com';

// The API has its own host and a /api path. The trailing slash keeps /api when a test calls a relative path such as `bookings`.
const apiUrl = (process.env.API_URL || 'https://api.eventhub.rahulshettyacademy.com/api').replace(/\/?$/, '/');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './reports/test-results',
  /* The app is slow on a shared server, so tests get a generous timeout. */
  timeout: 40 * 1000,
  expect: {
    timeout: 15 * 1000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { outputFolder: 'reports/html' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    screenshot: 'only-on-failure',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* The UI and the API run on different hosts, so each project has its own base URL. */
  projects: [
    {
      name: 'ui',
      testDir: './tests/ui',
      /* Tests use relative paths such as `page.goto('/login')`. Set BASE_URL in .env to change the environment. */
      use: { ...devices['Desktop Chrome'], baseURL: baseUrl },
    },

    {
      name: 'api',
      testDir: './tests/api',
      /* Tests use paths without a leading slash such as `request.get('bookings')`, so /api is kept. */
      use: { baseURL: apiUrl },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

