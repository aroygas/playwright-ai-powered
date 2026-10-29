# Quality gates

Three rules keep the suite trustworthy: new tests must prove they are stable, known problems are labelled explicitly, and visual baselines come from one reproducible place.

## Flaky gate

Every PR re-runs the tests it touches several times. A test that is not stable five times in a row does not get merged.

```bash
npm run test:flaky      # E2E (chromium) + API specs affected by the diff vs origin/main, x5, no retries
npm run test:flaky:ct   # same for component tests
npm run test:flaky -- --repeat-each=10 --only-changed=main   # later flags win: more runs, other base ref
```

- Built on `--only-changed` (specs changed or importing a changed file) + `--repeat-each=5 --retries=0`. Retries are off on purpose: a retry that rescues a test is exactly the flakiness we are hunting.
- Runs as the `flaky-gate` job in `.github/workflows/pr.yml` (PR only). No changed tests → passes.
- Locally, the base ref is `origin/main`; fetch it first (`git fetch origin main`).

## Failing tests: pick the right label

| Situation                                          | Use                                       | Effect                                                                      |
| -------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| Test is **unstable** (passes/fails with no change) | `TAGS.quarantine` + tracking issue        | Excluded from every run; `npm run test:quarantine` runs only these          |
| Test is **right**, the product has a **known bug** | `test.fail()` + issue link in the title   | Run stays green while the bug exists, **turns red when the bug is fixed**   |
| Feature/env genuinely unavailable                  | `test.skip(condition, 'reason')`          | Skipped and shown as skipped in the report                                  |
| Anything else                                      | Fix the test. Never retry/skip silently.  |                                                                             |

```ts
test('booking total is rounded (BUG-123)', { tag: [TAGS.regression] }, async ({ bookings }) => {
  test.fail(true, 'BUG-123: total is not rounded to 2 decimals');
  // ... the assertion describing the CORRECT behaviour ...
});
```

Quarantine hygiene: every quarantined test links an issue, is reviewed in the nightly report, and is removed from quarantine (or deleted) once fixed. Quarantine is a waiting room, not a graveyard.

## Visual regression baselines

Pixel comparisons are only meaningful when every machine renders identically, so there is **one** valid source of baselines: the Linux Playwright Docker image (`mcr.microsoft.com/playwright:v<pinned>-noble`, the same image CI mirrors).

- Baselines live in `tests/component/__snapshots__/visual.spec.tsx-snapshots/<name>-<project>.png`: no OS suffix, no `-win32`/`-darwin` files.
- Visual specs are **skipped on non-Linux hosts** so a Windows/macOS laptop never reports false diffs. `FORCE_VISUAL=1` overrides this if you want to look at the diff yourself (expect font noise).
- Create or refresh baselines (needs Docker, works on any host OS):

  ```bash
  npm run test:ct:update
  ```

  It builds the image, runs `visual.spec.tsx` with `--update-snapshots` and writes the PNGs straight into the working tree via a bind mount.

- Review baseline changes like code: open the PNG diff in the PR, make sure the change is intended, never commit a baseline you did not look at.
- Bumping Playwright (always with the Docker tag, see `docs/DESIGN.md`, "Playwright version lock") can shift rendering: run `npm run test:ct:update` in the same PR.
