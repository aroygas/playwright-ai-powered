# Contributing

Thanks for helping out! This repo is a template, so consistency matters more than cleverness. The rules below are the same ones AI agents follow ([`AGENTS.md`](AGENTS.md) is the source of truth).

## Setup

```bash
npm ci
npm run browsers:install   # all browsers; a missing one fails with "Executable doesn't exist"
npm run ai:check
```

Node ≥ 22.22.1 (`.nvmrc` pins 24; CI runs static checks on 22 and 24) and npm ≥ 10.9. Husky installs the git hooks on `npm ci`: lint-staged formats and lints staged files, commitlint checks the commit message.

## Workflow

1. Branch from `main`.
2. Make the change and add or update a test that proves it (tagged from `TAGS` in `src/utils/tags.ts`).
3. Run `npm run ai:check`. It must be green.
4. Commit with [Conventional Commits](https://www.conventionalcommits.org/): `feat: …`, `fix: …`, `docs: …`, `chore: …`.
5. Open a PR. CI runs static checks, component, API and E2E smoke tests, and the flaky gate.

## Rules that reviews enforce

- No sleeps; use web-first assertions.
- No raw locators; `getByRole` > `getByLabel` > `getByTestId` inside Page/Component Objects only.
- Specs import `test`/`expect` from `@fixtures` (component specs from `@playwright/experimental-ct-react`).
- Auth through `test.use({ role })`, data through factories and API fixtures, URLs and credentials only from `env`.
- Services return, specs assert. Page actions carry `@step()`.
- `eslint-disable` needs a justification.

The full list, with examples, is in [`AGENTS.md`](AGENTS.md); templates and prompts are in `.ai/`.

## Tests that misbehave

- **Flaky:** quarantine it with `TAGS.quarantine` and a tracking issue.
- **Known product bug:** `test.fail()` with the issue link.
- Never add retries or silent skips. See [`docs/QUALITY.md`](docs/QUALITY.md).

## Visual baselines

Never generate them on your machine. Run `npm run test:ct:update` (Docker) and review the changed PNGs in the PR.

## Playwright version

`@playwright/test`, `playwright`, `@playwright/experimental-ct-react` and the Docker image tag move together, exactly. Don't bump one in isolation.

## Reporting issues

Include the command you ran, the environment (`TEST_ENV`), and the trace or Allure report if there is one. Never paste credentials or tokens.
