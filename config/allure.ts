import os from 'node:os';
import { env } from './environments';

/** Single source for the allure-playwright reporter options (used by the run and the merge config). */
export const allureReporter = [
  'allure-playwright',
  {
    resultsDir: 'allure-results',
    detail: true,
    suiteTitle: false,
    // Written to the report's "Environment" widget. Never put secrets here.
    environmentInfo: {
      TEST_ENV: process.env.TEST_ENV ?? 'local',
      BASE_URL: env.baseURL,
      API_URL: env.apiURL,
      NODE: process.version,
      OS: `${os.platform()} ${os.release()}`,
    },
    categories: [
      {
        name: 'Ignored / quarantined',
        matchedStatuses: ['skipped'],
      },
      {
        name: 'Product defects (assertion failures)',
        matchedStatuses: ['failed'],
        messageRegex: '.*(expect|Expected|toHave|toBe).*',
      },
      {
        name: 'Timeouts / flaky infrastructure',
        matchedStatuses: ['broken', 'failed'],
        messageRegex: '.*(Timeout|timeout|net::|ECONNRESET|ETIMEDOUT).*',
      },
      {
        name: 'Test defects (errors in test code)',
        matchedStatuses: ['broken'],
      },
    ],
  },
] as const;
