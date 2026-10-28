import { defineConfig } from '@playwright/test';
import { allureReporter } from './config/allure';

// Used only by `npm run report:merge` (playwright merge-reports --config ...): turns the sharded
// blob reports into HTML, machine-readable JSON (for healer agents) and Allure results.
export default defineConfig({
  testDir: './tests',
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'merged-report/results.json' }],
    [...allureReporter],
  ],
});
