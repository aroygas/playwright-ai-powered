import { test, expect } from '@fixtures';
import { TAGS } from '@utils/tags';

// Pattern for quarantining a flaky test: add TAGS.quarantine and link the tracking issue.
// Quarantined tests are skipped by every run (grepInvert in playwright.config.ts) and only
// executed via `npm run test:quarantine`. Remove the tag once the test is stable again.
test(
  'quarantine example: health check (tracked in ISSUE-0)',
  { tag: [TAGS.api, TAGS.quarantine] },
  async ({ request }) => {
    const response = await request.get('/ping');
    expect(response.status()).toBe(201);
  },
);
