# Playwright AI-Powered

**An AI-ready Playwright + TypeScript template for Web UI, API and Component testing.** Strict architecture, guardrails that agents can't talk their way around, and CI/reporting wired from day one.

[![PR](https://github.com/aroygas/PlaywrightAIpowered/actions/workflows/pr.yml/badge.svg)](https://github.com/aroygas/PlaywrightAIpowered/actions/workflows/pr.yml)
[![Nightly](https://github.com/aroygas/PlaywrightAIpowered/actions/workflows/nightly.yml/badge.svg)](https://github.com/aroygas/PlaywrightAIpowered/actions/workflows/nightly.yml)
[![Allure report](https://img.shields.io/badge/Allure-live%20report-8A2BE2)](https://aroygas.github.io/PlaywrightAIpowered/)
![Playwright](https://img.shields.io/badge/Playwright-1.62.1-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/Node-%E2%89%A524-5FA04E?logo=nodedotjs&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Demo targets: [saucedemo.com](https://www.saucedemo.com) (web) and [restful-booker](https://restful-booker.herokuapp.com) (API). Swap them for your own with one command, see [Use as a template](#use-as-a-template).

## Highlights

|                          |                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| 🧱 **Three test layers** | E2E (Chromium, Firefox, WebKit, mobile), API (no browser) and React component tests on one shared toolbox |
| 🧩 **Component Object Model** | Pages compose components; locators only via `getByRole` > `getByLabel` > `getByTestId`, enforced by lint |
| 🔐 **Auth once per role** | `test.use({ role: 'admin' })`: cached `storageState` + API token, no login steps in specs                |
| 🧪 **Typed API layer**   | `ApiClient` + thin services + zod contract checks + faker factories with auto-cleanup                     |
| 🤖 **Built for agents**  | One `AGENTS.md`, glob-scoped rules, prompts, MCP servers, planner/generator/healer agents, `npm run ai:check` |
| 🚦 **Quality gates**     | Flaky gate on changed specs, quarantine policy, Docker-rendered visual baselines                          |
| 📊 **CI + Allure**       | Sharded GitHub Actions, GitLab mirror, Allure with history published to GitHub Pages                      |

## Architecture

```mermaid
flowchart LR
  spec["Specs<br/>e2e · api · component"] --> fx["Fixtures<br/>base · ui · api · auth"]
  fx --> pages["Pages → Components"]
  fx --> svc["API services → ApiClient"]
  fx --> data["Factories + cleanup"]
  pages --> sut(("System<br/>under test"))
  svc --> sut
  cfg["config/environments.ts<br/>(zod, TEST_ENV)"] -.-> fx
  ct["Component tests"] --> pg["playground/<br/>React + Vite"]
  pages -. "same component objects" .-> ct
```

Specs only call objects and assert. Objects only locate and act. Services only return responses. Details and the full map: [`AGENTS.md`](AGENTS.md).

## Quick start

```bash
git clone https://github.com/aroygas/PlaywrightAIpowered.git
cd PlaywrightAIpowered
npm ci
npx playwright install chromium
npm run test:smoke      # E2E + API smoke
npm run test:ct         # component tests
```

Requires Node ≥ 24 and npm ≥ 11 (see `.nvmrc`). Credentials for the demo sites are public and committed in `config/env/*.env`; override anything via process env or a gitignored `.env` (see `.env.example`).

## Commands

| Command                                              | What                                                      |
| ---------------------------------------------------- | --------------------------------------------------------- |
| `npm run ai:check`                                   | Lint + typecheck + list + smoke: the gate before any change |
| `npm test` / `test:smoke` / `test:api` / `test:e2e`  | Everything / smoke / API only / all browsers              |
| `npm run test:ct`                                    | Component tests                                           |
| `npm run test:env:<local\|dev\|staging\|prod>`       | Pick the target environment                               |
| `npm run test:flaky`                                 | Re-run changed specs ×5 without retries                   |
| `npm run test:ct:update`                             | Regenerate visual baselines in Docker                     |
| `npm run docker:test`                                | Run in the pinned Playwright image                        |
| `npm run report:allure` / `report:allure:open`       | Build / open the Allure report                            |
| `npm run playground:dev`                             | Explore the component playground                          |

## Project layout

```
config/       typed env (zod) + per-environment defaults
src/          api/ (client, services, schemas) · ui/ (components, pages) · fixtures/ · auth/ · data/ · utils/
tests/        e2e/ · api/ · component/ · setup/ · seed.spec.ts
playground/   React + Vite app mounted by component tests
specs/        Markdown test plans (planner agent)
.ai/          prompts and code templates for agents
docs/         CI · MCP · QUALITY · ROADMAP
```

## AI-ready by design

- **One source of truth:** [`AGENTS.md`](AGENTS.md) holds the architecture map, golden rules and Definition of Done; Claude, Cursor, Windsurf, Cline and Copilot rules are thin pointers to it.
- **Guardrails over guidelines:** ESLint bans sleeps, raw locators and unjustified `eslint-disable`; the closed tag vocabulary lives in `src/utils/tags.ts`.
- **Live grounding:** MCP servers for browser exploration, test running and the repo ([`docs/MCP.md`](docs/MCP.md)).
- **Agent loop:** planner → `specs/*.md` → generator → `tests/**` → healer, all seeded by `tests/seed.spec.ts`.
- **Self-check:** `npm run ai:check` runs the same gate for agents locally and for CI.

## CI & reports

PRs run lint/typecheck, component, API, a sharded E2E smoke and the flaky gate. The nightly regression covers all browsers and publishes an [Allure report](https://aroygas.github.io/PlaywrightAIpowered/) with history to GitHub Pages. Details: [`docs/CI.md`](docs/CI.md), policies: [`docs/QUALITY.md`](docs/QUALITY.md).

## Use as a template

Click **Use this template** on GitHub (or clone), then:

```bash
npm run init:project -- --name acme-e2e --base-url https://staging.acme.com --api-url https://api.staging.acme.com --repo acme/acme-e2e --author "Acme Inc"
```

This renames the package and reports, points every environment at your URLs, resets the demo credentials to placeholders and prints the remaining manual steps (swap the demo pages/services/specs, roles, CI secrets). Add `--dry-run` to preview.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Roadmap: [`docs/ROADMAP.md`](docs/ROADMAP.md).

## License

[MIT](LICENSE)
