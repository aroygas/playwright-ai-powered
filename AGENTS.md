# AGENTS.md — single source of truth for AI agents

TypeScript + Playwright framework for Web UI (E2E), API and Component testing. Cursor, Windsurf, Cline, Claude and Copilot rules all point here; **edit this file, not the thin wrappers**. Design decisions: `docs/DESIGN.md`. MCP setup: `docs/MCP.md`. CI/Docker/Allure: `docs/CI.md`. Quality gates: `docs/QUALITY.md`.

## Architecture map

| Path                                                       | Contract                                                                                  |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `config/environments.ts`, `config/env/*.env`               | Typed `env` (zod). Only source of URLs/creds/timeouts (`TEST_ENV`).                       |
| `src/api/client/ApiClient.ts`                              | `APIRequestContext` wrapper: auth injection, typed `ApiResponse<T>`, logging.             |
| `src/api/services/*Service.ts`                             | One thin class per domain. Returns responses, **never asserts**.                          |
| `src/api/schemas/*.ts`                                     | zod schemas + `expectSchema()` for contract checks.                                       |
| `src/ui/components/`                                       | Component Objects extending `BaseComponent(root: Locator)`.                               |
| `src/ui/pages/`                                            | Page Objects extending `BasePage` (`path`, `goto()`, `isLoaded()`); compose components.   |
| `src/fixtures/`                                            | `base`, `ui`, `api`, `auth` fixtures merged in `index.ts`.                                |
| `src/auth/`                                                | `roles.ts` (admin/user/guest), session reuse; state is cached in the gitignored `.auth/`. |
| `src/data/factories/`                                      | faker builders with overrides + `CleanupRegistry`.                                        |
| `src/utils/`                                               | `step` decorator, `tags.ts` (closed tag vocabulary).                                      |
| `tests/e2e`, `tests/api`, `tests/component`, `tests/setup` | Specs per layer; `tests/seed.spec.ts` seeds the Test Agents.                              |
| `playground/`                                              | React+Vite app mounted by Component Tests; explorable via `npm run playground:dev`.       |
| `specs/`                                                   | Markdown test plans (planner agent).                                                      |
| `.ai/prompts`, `.ai/templates`                             | Few-shot prompts and code templates.                                                      |

Path aliases: `@api/* @ui/* @fixtures @fixtures/* @data/* @auth/* @utils/* @config/* @playground/*`.

## Golden rules

1. **No sleeps.** `page.waitForTimeout` is lint-banned. Use web-first assertions (`await expect(locator).toBeVisible()`) and `expect.poll`.
2. **No raw locators.** `page.locator(...)`, CSS/XPath strings, `page.$`/`$$` are lint-banned. Order: `getByRole` > `getByLabel` > `getByTestId` (attribute is `data-test`). No accessible handle → add a `data-test` attribute to the SUT/playground, never a CSS selector.
3. **Locators live in Component/Page Objects, not in specs.** Specs call object methods and assert on exposed locators. (CT specs may use the `mount()` result's `getByRole`/`getByTestId` directly or wrap it in a shared component.)
4. **Fixtures-only imports.** E2E/API specs: `import { test, expect } from '@fixtures'`. CT specs: `@playwright/experimental-ct-react`.
5. **Auth via role**, never login steps: `test.use({ role: 'user' | 'admin' | 'guest' })`.
6. **Tags come from `TAGS`** (`@utils/tags`: `smoke`, `regression`, `api`, `quarantine`): `{ tag: [TAGS.smoke] }`.
7. **Data via factories & API fixtures** (`buildBooking`, `createBooking`, `cleanup.register`). Created entities must be auto-cleaned. No hardcoded URLs/credentials: use `env` / `getCredentials`.
8. **Services return, specs assert.** No `expect` in services; components/pages only expose `expectX()` helpers (the `expectX` name is required: lint treats it as an assertion).
9. **Page actions carry `@step()`** for readable reports.
10. **Visual baselines:** one platform-neutral PNG per snapshot, rendered in the Linux Docker image only. Never generate them on the host; refresh with `npm run test:ct:update` and review the PNG diff. Visual specs skip on non-Linux hosts (`FORCE_VISUAL=1` overrides). See `docs/QUALITY.md`.
11. **Playwright version lock:** `@playwright/test`, `playwright`, `@playwright/experimental-ct-react` stay on the same exact version (`1.62.1`). Never bump one alone.
12. **Flaky test?** Tag it `TAGS.quarantine` with a tracking issue; known product bug → `test.fail()` with the issue link. Never retry/skip silently. PRs re-run changed specs ×5 (flaky gate, `docs/QUALITY.md`).
13. `eslint-disable` needs a justification (`// eslint-disable-next-line rule -- reason`).

## Commands

| Command                                                    | What                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `npm run ai:check`                                         | **Run before finishing any task.** lint + typecheck + `--list` + smoke (chromium, api, ct). |
| `npm run lint` / `typecheck` / `format:check`              | Static checks.                                                                              |
| `npm run test:smoke` / `test:api` / `test:e2e` / `test:ct` | Test subsets.                                                                               |
| `npm run test:list`                                        | List tests without running (catches import/config errors).                                  |
| `npm run test:env:<local\|dev\|staging\|prod>`             | Choose environment.                                                                         |
| `npm run test:flaky` / `test:ct:update`                    | Re-run changed specs ×5 without retries; regenerate visual baselines in Docker.             |
| `npm run test:quarantine`                                  | Run only `@quarantine` (flaky) tests; excluded from every other run.                        |
| `npm run docker:test` / `report:merge` / `report:allure`   | Containerized run; merge shard blobs; build Allure report.                                  |
| `npm run playground:dev`                                   | Run the playground for live exploration.                                                    |

## Definition of Done

- [ ] `npm run ai:check` is green.
- [ ] New behaviour has ≥1 test proving it, tagged from `TAGS`.
- [ ] No golden rule violated (no sleeps, raw locators, hardcoded URLs/creds; fixtures-only imports).
- [ ] This file / folder READMEs updated if a pattern changed.
- [ ] Changes staged, not committed, unless asked.

## Playbooks

Prefer the matching prompt in `.ai/prompts/` and template in `.ai/templates/`: new page object, API service from OpenAPI, E2E from user story, CT spec, heal a failing test. Test Agents: planner → `specs/*.md`, generator → `tests/**`, healer fixes failures (see `.claude/agents/`, seed `tests/seed.spec.ts`).
