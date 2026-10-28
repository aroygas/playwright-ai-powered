# specs

Markdown test plans written by the Playwright **planner** agent (`.claude/agents/playwright-test-planner.md`) and consumed by the **generator** agent. One plan per feature, e.g. `specs/checkout.plan.md`.

- Plans are intent only (scenarios, steps, expected results); executable code lives in `tests/`.
- Each plan references the seed test `tests/seed.spec.ts`, which sets up the environment (role, page objects).
- Generated specs must follow `AGENTS.md` (fixtures-only imports, no raw locators, tags from `@utils/tags`).
