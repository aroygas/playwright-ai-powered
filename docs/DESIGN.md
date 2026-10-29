# Design decisions

Why the template is built the way it is. Rules and commands live in [`AGENTS.md`](../AGENTS.md); this file only records the reasoning, so you can change a decision knowingly.

## Playwright version lock

`@playwright/test`, `@playwright/experimental-ct-react` and the transitive `playwright` stay on one exact version (currently `1.62.1`) and are never bumped separately, including by Renovate/Dependabot.

- The component-testing runner is published under the `experimental-ct-*` name and can lag the main release. A mismatch between it and `@playwright/test` breaks at runtime.
- The Docker image tag (`docker/Dockerfile`, `.gitlab-ci.yml`) must equal the pinned version, because browser builds and rendering come from the image.
- To bump: change all three packages, the image tags and the README badge together, then run `npm run test:ct:update` and review the PNG diff in the same PR. Do it only once the CT runner publishes the new version.

## Visual baselines are rendered in Docker only

Pixel output differs between operating systems and font stacks, so a baseline made on a laptop fails on CI. There is exactly one sanctioned source: the pinned Linux image, via `npm run test:ct:update`. Baselines are platform-neutral PNGs (one per snapshot), and visual specs skip on non-Linux hosts unless `FORCE_VISUAL=1`. Details and review rules: [`QUALITY.md`](QUALITY.md).

## Auth reuse: TTL, cookie expiry, and what is not covered

Specs get a logged-in session through `test.use({ role })` instead of login steps. Sessions are cached under `.auth/` (gitignored) as Playwright `storageState` files plus API tokens, and reused while fresh.

- Freshness is `AUTH_TTL_MINUTES` (default 30) **and** the earliest session-cookie expiry (`isFresh` in `src/auth/session.ts`). API tokens use a shorter cap of 5 minutes because restful-booker wipes tokens every ~10 minutes.
- Known gap: there is no live probe against the system under test. A SUT that invalidates sessions on the server earlier than the TTL (saucedemo can) leaves a file that looks fresh but is dead, which shows up as a flaky first test. If your SUT does this, lower the TTL or add a cheap authenticated request to the setup step and re-login on failure.
- Parallel-unsafe flows use one account per worker (`WORKER_ACCOUNTS`); `playwright.config.ts` caps `workers` at the number of accounts.

## Demo systems under test

Examples run against two public demo sites: saucedemo.com (web) and restful-booker.herokuapp.com (API). They need no setup, no accounts to create and no local infrastructure, so a fresh clone can go green in minutes, and their credentials are public (committed in `config/env/*.env`).

The cost is a dependency on third-party uptime: if either site is down, `ai:check` and PR CI go red for reasons unrelated to your change. Everything is swappable through `config/env` and `npm run init:project`; for real projects point the URLs at your own environments and keep credentials in CI secrets.

## Everything agent-related is centralised in `AGENTS.md`

Cursor, Windsurf, Cline, Copilot and Claude each read a different file. Copying the rules into each one guarantees they drift, so those files are thin pointers to `AGENTS.md`, which holds the architecture map, golden rules, commands and Definition of Done. Only layer-specific, glob-scoped hints live in `.cursor/rules/*.mdc`. When a rule changes, edit `AGENTS.md`, not the wrappers.

The rules are enforced by tooling where possible (ESLint bans sleeps, raw locators, unjustified `eslint-disable` and direct `@playwright/test` imports in specs; `npm run ai:check` is the shared gate for agents, humans and CI), because a rule that is only prose gets ignored by the next generated test.
