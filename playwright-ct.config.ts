import { defineConfig, devices } from '@playwright/experimental-ct-react';
import viteConfig from './playground/vite.config';

const isCI = !!process.env.CI;

// Component testing: separate from playwright.config.ts (no env/auth/setup involved).
// The Vite config is the playground's, so aliases and plugins stay in one place.
export default defineConfig({
  testDir: './tests/component',
  snapshotDir: './tests/component/__snapshots__',
  outputDir: 'test-results/ct',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? Number(process.env.WORKERS ?? 2) : undefined,
  reporter: isCI
    ? [['blob'], ['github'], ['list']]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/ct' }]],
  expect: { toHaveScreenshot: { animations: 'disabled', caret: 'hide' } },
  use: {
    ...devices['Desktop Chrome'],
    testIdAttribute: 'data-test',
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',
    ctPort: 3100,
    ctViteConfig: viteConfig,
  },
  projects: [{ name: 'component' }],
});
