import os from 'node:os';
import { defineConfig, devices } from '@playwright/test';
import { env } from './config/environments';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // Each parallel worker needs its own WORKER_ACCOUNTS entry (parallel-unsafe flows), so never exceed it.
  // Local: half of cores (Playwright default). CI: explicit and overridable via WORKERS.
  workers: Math.max(
    1,
    Math.min(
      isCI ? Number(process.env.WORKERS ?? 2) : Math.ceil(os.cpus().length / 2),
      env.auth.workerAccounts.length || Infinity,
    ),
  ),
  timeout: env.timeouts.test,
  expect: { timeout: env.timeouts.expect },
  // blob reports are required for --shard + merge-reports (`npm run report:merge`).
  reporter: isCI ? [['blob'], ['github'], ['list']] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: env.baseURL,
    actionTimeout: env.timeouts.action,
    navigationTimeout: env.timeouts.navigation,
    testIdAttribute: 'data-test',
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testDir: './tests/setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      // Seed for Playwright Test Agents (planner/generator/healer); see specs/README.md.
      name: 'seed',
      testDir: './tests',
      testMatch: /seed\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      testDir: './tests/e2e',
      use: { ...devices['Pixel 7'] },
      dependencies: ['setup'],
    },
    {
      // No browser: pure APIRequestContext tests.
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: env.apiURL },
    },
  ],
});
