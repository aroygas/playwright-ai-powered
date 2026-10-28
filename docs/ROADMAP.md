# Implementation Roadmap — AI-Ready Playwright Framework

Reusable TypeScript + Playwright framework for Web UI, API and Component Testing, optimized for AI agents (Cursor, Windsurf, Cline, Claude) and MCP-driven test generation. Each task below (`P<phase>.<n>`) is sized to be handed to a separate chat.

**Defaults (adjust here if they change):** npm with engines pinned to the local toolchain (`node >=24.0.0`, `npm >=11.0.0`); React + Vite as the CT demo stack — package stays `@playwright/experimental-ct-react` (CT is still published under the `experimental-ct-*` namespace), but the architecture relies on a decoupled `playground/` Vite app whose config the CT runner reuses; public demo SUTs for examples (Web: `saucedemo.com`, API: `restful-booker.herokuapp.com`) replaceable via env config; GitHub Actions as primary CI, GitLab as mirror.

## Conventions for every chat task
- Task IDs `P<phase>.<n>`; one chat = one task (or a small contiguous group).
- Prompt template: *"Read `docs/ROADMAP.md` + `AGENTS.md`. Implement task Px.y only. Don't commit; stage changes. Run `npm run lint && npm run typecheck` (+ relevant tests) before finishing."*
- Definition of Done: lint/typecheck green, ≥1 example test proving the feature, docs/AGENTS.md updated if a pattern changed.

## Execution constraints (learned during implementation)
- **`AGENTS.md` does not exist yet** (created in P6.1). Until then, `docs/ROADMAP.md` is the only contract: ignore the `AGENTS.md` half of the prompt template and treat this file as the source of truth.
- **Playwright version lock:** `@playwright/test`, `playwright` and `@playwright/experimental-ct-react` are pinned to exact `1.62.1`, the newest version the CT runner publishes. Mismatched `@playwright/test` / CT runner versions break at runtime, so they must be bumped together, and only once CT publishes a newer release. Don't bump one in isolation (incl. Renovate/Dependabot). The P7.1 Docker image tag must match this pin.
- **Visual baselines:** `-win32` baselines are local-debugging artifacts; `-linux` baselines (CI-valid) are generated only inside the P7.1 Docker image (see AGENTS.md rule 10). No macOS baselines. The full strategy (update workflow, review) remains P8.2.
- **Lint — custom assertion helpers:** ESLint has an override for `playwright/expect-expect` so helper methods named `expectX()` (e.g. `expectVisible()`) count as valid assertions. New assertion helpers must follow the `expectX` naming.
- **Auth session flakiness:** the 30-minute auth TTL (P2.2) is unreliable: saucedemo.com expires sessions sooner on its backend, so a file that looks fresh may hold a dead session. P2 must add a resilient validation loop or fallback instead of trusting TTL alone (see P2.2).

## Target layout
```
config/            env/*.env, environments.ts (zod schema)
src/
  api/             client/ (ApiClient base), services/ (per-domain), schemas/ (zod)
  ui/              components/ (Component Objects), pages/ (Page Objects = composition)
  fixtures/        base.ts, ui.fixtures.ts, api.fixtures.ts, auth.fixtures.ts, index.ts (mergeTests)
  auth/            roles.ts, global.setup.ts, storage/ (gitignored)
  data/            factories/ (faker builders), static/
  utils/           logger, waits, step decorator
tests/
  e2e/  api/  component/  setup/
playwright/        ct index.tsx + index.html (CT mount entry)
playground/        minimal React+Vite app used by CT
.ai/               prompts/ (few-shot), templates/, glossary.md
.cursor/rules/*.mdc  .windsurfrules  .clinerules  AGENTS.md  CLAUDE.md
.mcp.json  .vscode/mcp.json
docker/  .github/workflows/  .gitlab-ci.yml
```

---

## Phase 0 — Foundation & Tooling
**Goal:** Deterministic, strict TS workspace that agents can't drift from.
**Scope:** `package.json`, `tsconfig.json` (strict, path aliases `@api/* @ui/* @fixtures/* @data/*`), ESLint flat config (`eslint-plugin-playwright`, `@typescript-eslint`), Prettier, `.editorconfig`, `.nvmrc`, `.gitignore`, Husky + lint-staged, npm scripts.
**Tasks:**
- P0.1 Init npm project, install `@playwright/test`, TS, browsers; pin exact versions (Playwright packages locked to `1.62.1`, see Execution constraints); `.nvmrc` (24); `package.json` `"engines": { "node": ">=24.0.0", "npm": ">=11.0.0" }` + `.npmrc` `engine-strict=true` so agents in isolated envs can't install with a mismatched toolchain; commit `package-lock.json`, CI uses `npm ci`.
- P0.2 `tsconfig` strict + path aliases; `typecheck` script.
- P0.3 ESLint flat config incl. `playwright/no-wait-for-timeout`, `no-force-option`, `prefer-web-first-assertions`, plus `no-restricted-syntax` selectors banning `page.locator(...)` / `.locator('<css|xpath string>')` and `page.$`/`$$` repo-wide (specs, pages, components). Single sanctioned escape hatch: `BaseComponent` root resolution, via `// eslint-disable-next-line -- reason` that a lint rule (`eslint-comments/require-description`) forces to be justified.
- P0.4 Prettier + Husky pre-commit (lint-staged) + commitlint (optional).
- P0.5 Scaffold folder tree with `README.md` stubs per folder describing its contract.
**AI/MCP readiness:** Lint rules are the hard guardrails agents receive as fast feedback; path aliases give agents stable, guessable import paths; per-folder READMEs act as local context when an agent opens a directory.

## Phase 1 — Core Config, Multi-Environment, Sharding
**Goal:** One `playwright.config.ts` driving all test types across envs, CI-shard-ready.
**Scope:** `playwright.config.ts`, `config/environments.ts`, `config/env/{local,dev,staging,prod}.env`, `.env.example`.
**Tasks:**
- P1.1 `environments.ts`: load `TEST_ENV` via dotenv, validate with zod (baseURL, apiURL, timeouts, feature flags); fail fast on missing vars.
- P1.2 Projects: `setup`, `chromium`, `firefox`, `webkit`, `api` (no browser), `mobile-chrome`; tag-based `grep` (`@smoke`, `@regression`, `@api`).
- P1.3 Retries/trace/video/screenshot policy per CI vs local; `fullyParallel`, workers by env.
- P1.4 Sharding: `--shard` + `blob` reporter in CI, `merge-reports` script; deterministic test ordering.
- P1.5 npm scripts matrix: `test:smoke`, `test:api`, `test:e2e`, `test:ct`, `test:env:<env>`.
**AI/MCP readiness:** Agents never hardcode URLs/creds — a single typed `env` object is the only source. Tags give agents a closed vocabulary for categorizing generated tests.

## Phase 2 — Global Authentication Isolation
**Goal:** Log in once per role, reuse `storageState`, zero cross-test leakage.
**Scope:** `src/auth/roles.ts`, `tests/setup/auth.setup.ts`, `src/fixtures/auth.fixtures.ts`, `.auth/` (gitignored).
**Tasks:**
- P2.1 Role registry (`admin`, `user`, `guest`) typed enum → creds from env.
- P2.2 `auth.setup.ts` as setup project dependency: API-first login (fallback UI), writes `.auth/<role>.json`; skip if fresh (TTL check). **TTL alone is not sufficient** (SUT sessions expire earlier than the TTL): also probe the stored session against the SUT (e.g. authenticated page/endpoint check) and re-login on failure; add a fallback to force re-auth (retry once, then fail with a clear error) in the fixture so stale sessions don't surface as flaky test failures.
- P2.3 Fixture `asRole(role)` / `test.use({ role })` that creates isolated contexts; multi-role in one test (two contexts).
- P2.4 Worker-scoped accounts for parallel-unsafe flows (`workerInfo.parallelIndex`).
- P2.5 API auth: token reused by `ApiClient` from same storage/state source.
**AI/MCP readiness:** Agents declare `test.use({ role: 'admin' })` instead of writing login steps — removes the most common source of flaky, duplicated generated code.

## Phase 3 — API Client Wrapper & API Fixtures
**Goal:** Typed, schema-validated API layer usable standalone and for UI test data setup.
**Scope:** `src/api/client/ApiClient.ts`, `src/api/services/*Service.ts`, `src/api/schemas/*.ts`, `src/fixtures/api.fixtures.ts`, `src/data/factories/`.
**Tasks:**
- P3.1 `ApiClient` over `APIRequestContext`: base URL, auth header injection, JSON helpers, typed `ApiResponse<T>`, request/response logging attached to report.
- P3.2 zod response validation helper (`expectSchema`), contract errors with readable diffs.
- P3.3 Service pattern (one class per domain, e.g. `BookingService`) — thin, no assertions.
- P3.4 Data factories (`@faker-js/faker`) with builder overrides; cleanup registry (auto-teardown of created entities in fixture).
- P3.5 Example API specs: CRUD, negative, schema, tags `@api`.
**AI/MCP readiness:** OpenAPI → zod/service generation becomes a templated agent task; strict "services return data, specs assert" split is easy for agents to copy.

## Phase 4 — Component Object Model & UI Fixtures
**Goal:** Modern COM: composable components, locators via role/test-id, pages are compositions.
**Scope:** `src/ui/components/BaseComponent.ts`, `src/ui/components/{Header,Table,Modal,Form}.ts`, `src/ui/pages/*Page.ts`, `src/fixtures/ui.fixtures.ts`, `src/fixtures/index.ts`.
**Tasks:**
- P4.1 `BaseComponent(root: Locator)` — everything scoped to root; no `page.$`, no XPath.
- P4.2 Strict locator policy: `getByRole` > `getByLabel` > `getByTestId` only; `page.locator()` and raw CSS/XPath strings are **banned** (enforced by the P0.3 `no-restricted-syntax` rule — mandatory guardrail against lazy agent output like `page.locator('div.btn > span')`); `testIdAttribute` configured; when no accessible handle exists, the fix is adding a `data-testid` to the SUT, not a CSS selector; no assertions inside components except explicit `expectX()`-style helpers (e.g. `expectVisible()`); ESLint `playwright/expect-expect` is overridden to recognize `expectX()` as an assertion.
- P4.3 `BasePage` with `path`, `goto()`, `isLoaded()`; pages compose components.
- P4.4 UI fixtures injecting page objects (`loginPage`, `inventoryPage`) lazily; `mergeTests` of ui+api+auth into single `test` export from `@fixtures`.
- P4.5 `test.step` / `@step` decorator for readable reports; custom `expect.extend` matchers.
- P4.6 Example E2E specs (smoke + data setup via API fixture).
**AI/MCP readiness:** A single `import { test, expect } from '@fixtures'` entry point and a fixed component template mean agents (and Playwright MCP snapshots, which expose roles/names) map directly to `getByRole` locators inside the right component.

## Phase 5 — Component Testing (mount + dev-server routing)
**Goal:** Isolated component tests with `mount()` on Vite, network mocked at component level.
**Scope:** `playwright-ct.config.ts`, `playwright/index.html|index.tsx` (providers/hooks via `beforeMount`), `playground/` (decoupled React+Vite app sharing the root `package.json`, with its own `vite.config.ts`, `src/components/`), `tests/component/`.
**Architecture note:** Package stays `@playwright/experimental-ct-react` (CT remains in the `experimental-ct-*` namespace); the runner orchestrates its own Vite dev server under the hood. The `playground/` app is the single source of components and Vite config: `ctViteConfig` imports `playground/vite.config.ts` (aliases, plugins), and the same app runs standalone (`npm run playground:dev`) so Playwright MCP / agents can explore components live and E2E can target it locally.
**Tasks:**
- P5.0 Scaffold decoupled `playground/` Vite+React app (2–3 sample components with `data-testid`/ARIA), `playground:dev` script.
- P5.1 Install `@playwright/experimental-ct-react`, separate CT config (`ctPort`, `ctViteConfig` reusing `playground/vite.config.ts` + TS aliases).
- P5.2 `beforeMount` hooks for theme/router/query providers via `hooksConfig`.
- P5.3 Network mocking with the CT `router` fixture (`router.route`, MSW handlers via `router.use`).
- P5.4 Shared component objects reused between CT and E2E (same `BaseComponent` with mounted root).
- P5.5 Example CT specs: props, events/callbacks, visual snapshot (`toHaveScreenshot`) with stable fonts.
**AI/MCP readiness:** CT specs are the cheapest agent-generated tests (fast, deterministic); reusing the same component objects keeps generated code consistent across layers.

## Phase 6 — AI Context Layer & MCP
**Goal:** Make the repo self-describing to Cursor/Windsurf/Cline/Claude and wire MCP servers.
**Scope:** `AGENTS.md` (single source of truth), `CLAUDE.md` → references AGENTS.md, `.cursor/rules/*.mdc` (scoped by glob: api, ui, ct, fixtures), `.windsurfrules`, `.clinerules`, `.ai/prompts/*.md`, `.ai/templates/*`, `.mcp.json`, `.vscode/mcp.json`, `.github/copilot-instructions.md`.
**Tasks:**
- P6.1 `AGENTS.md`: architecture map, golden rules (no sleeps, no raw locators in specs, fixtures-only imports, tags, data via factories), DoD checklist, commands.
- P6.2 Glob-scoped Cursor rules (`.mdc`) per layer; thin `.windsurfrules`/`.clinerules` pointing to AGENTS.md (avoid duplication drift).
- P6.3 Few-shot pack `.ai/prompts/`: "new page object", "new API service from OpenAPI", "new E2E from user story", "new CT spec", "heal a failing test" — each with input → expected output example from repo code.
- P6.4 Code templates `.ai/templates/` (component, page, service, spec) + optional `plop` generator script.
- P6.5 MCP config: `@playwright/mcp` (browser exploration → locators), GitHub MCP (issues→tests), filesystem scoped to repo; optional OpenAPI MCP. Document targets & permissions.
- P6.6 Playwright Test Agents (`npx playwright init-agents` planner/generator/healer) wired to repo seed test `tests/seed.spec.ts` + `specs/` plan folder.
- P6.7 Validation loop: `npm run ai:check` (lint + typecheck + `--list` + smoke) agents must run before finishing.
**AI/MCP readiness:** This phase *is* the AI layer: one canonical rules file, layered rules by glob, real few-shot examples from the repo, MCP for live DOM grounding, and an executable self-check so generated tests can't merge in broken patterns.

## Phase 7 — CI/CD, Docker, Allure
**Goal:** Reproducible containerized runs, sharded pipelines, rich reporting.
**Scope:** `docker/Dockerfile` (`mcr.microsoft.com/playwright:v<pinned>-noble`), `docker-compose.yml`, `.github/workflows/{pr,nightly}.yml`, `.gitlab-ci.yml`, Allure config.
**Tasks:**
- P7.1 Dockerfile + compose (env via `--env-file`, volume for reports); version pinned to `@playwright/test`.
- P7.2 GH Actions PR workflow: lint/typecheck → CT → API → E2E smoke matrix sharded (`shard: [1/4..4/4]`) → merge blob reports → upload artifact.
- P7.3 Nightly regression workflow (cron, all browsers, `TEST_ENV` input via `workflow_dispatch`).
- P7.4 `allure-playwright` reporter, categories, environment.properties, history across runs (gh-pages or artifact); attach API logs, traces.
- P7.5 GitLab CI mirror with `parallel:` sharding + Allure artifacts.
- P7.6 Secrets handling (GH secrets → env), caching of npm/browsers, flaky test quarantine via `@quarantine` tag.
**AI/MCP readiness:** Structured artifacts (JSON reporter, traces, Allure) give healer agents machine-readable failure context; CI = the same `ai:check` gate agents run locally.

## Phase 8 — Hardening & Template Release
**Goal:** Turn repo into a reusable template.
**Tasks:**
- P8.1 Quality gates: flaky detection (`--repeat-each` on changed specs), `test.fail`/quarantine policy.
- P8.2 Visual regression baseline strategy (Docker-only snapshots). Replaces the current local `-win32`-only baselines; deferred until then.
- P8.3 `npm run init:project` script to rename SUT/env/roles; GitHub template repo flag.
- P8.4 CONTRIBUTING.md + docs site (optional); final README with quick start.

## Recommended execution order
P0 → P1 → P2 ∥ P3 → P4 → P5 → P6 (P6.1–6.2 can start right after P4) → P7 → P8. Phases P2 and P3 can run in parallel chats (different files).
