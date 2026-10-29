import { defineConfig } from '@playwright/test';
import { allureReporter } from './config/allure';

// Used only by `npm run report:merge` (playwright merge-reports --config ...): turns the sharded
// blob reports into HTML, machine-readable JSON (for healer agents) and Allure results.
// Known: allure-playwright 3.14 throws in onConfigure during merge (config.projects is still empty),
// so the command exits 1 although the output is complete; CI tolerates that (see the report action).
export default defineConfig({
  testDir: './tests',
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'merged-report/results.json' }],
    [...allureReporter],
  ],
});
