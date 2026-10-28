# Prompt: heal a failing test

**Read first:** `AGENTS.md`. Healer agent: `.claude/agents/playwright-test-healer.md`.

## Input

> `tests/e2e/smoke.spec.ts › logs in through the UI` fails with `locator.click: Timeout ... getByRole('button', { name: 'Login' })`.

## Steps

1. Reproduce: `npx playwright test tests/e2e/smoke.spec.ts --project=chromium`; read the error, trace (`npx playwright show-trace`) and report.
2. Classify: (a) locator/UI changed → inspect the live DOM with the `playwright` MCP and fix the **component/page object**; (b) timing → replace with a web-first assertion, never `waitForTimeout`; (c) data/auth → fix fixture or factory, or re-auth (stale session); (d) real product bug → keep the test, report it (`test.fail()` + issue link), don't weaken the assertion.
3. Fix at the lowest layer (object, not spec). Don't add `force: true`, sleeps or CSS selectors.
4. Re-run the test 3× (`--repeat-each=3`), then `npm run ai:check`.

## Expected output (diff, fix lives in the page object)

```diff
- await expect(this.page.getByRole('button', { name: 'Login' })).toBeVisible();
+ await expect(this.page.getByRole('button', { name: 'Log in' })).toBeVisible();
```

Explain root cause in one sentence in the summary.
