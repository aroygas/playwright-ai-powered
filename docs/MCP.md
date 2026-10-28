# MCP servers

Configured in `.mcp.json` (Claude Code, Cursor, Cline, Windsurf) and mirrored in `.vscode/mcp.json` (VS Code / Copilot). Keep both in sync.

| Server | Purpose | Target / scope | Permissions |
| --- | --- | --- | --- |
| `playwright` (`@playwright/mcp`, pinned) | Explore the live DOM via accessibility snapshots → derive `getByRole` / `getByTestId` locators. Launched with `--test-id-attribute data-test` to match the SUT. | Public SUTs from `config/env/*.env` (saucedemo.com). Browse-only; never use it to write specs directly. | Local browser, no credentials stored. |
| `playwright-test` (`playwright run-test-mcp-server`) | Backs the planner/generator/healer agents (`.claude/agents/`): run tests, read failures, drive seed-based generation. | This repo's `playwright.config.ts`; seed `tests/seed.spec.ts`; plans in `specs/`. | Runs local tests. |
| `github` (remote, read-only endpoint) | Issues/PRs → test ideas ("issues→tests"). | This repository. Token from `GITHUB_MCP_TOKEN` (Claude Code) or the VS Code prompt. | Use a fine-grained PAT with read-only `contents`, `issues`, `pull requests`. Never commit it. |
| `filesystem` (pinned) | File access scoped to the repo root only. | `.` (repo root). | Read/write inside the repo; nothing outside. |

Optional (not enabled by default): an OpenAPI MCP server pointed at the SUT's spec, for the "new API service from OpenAPI" prompt. Add it to both config files when a spec URL exists.

## Rules for agents
- MCP output is *evidence*, never code: translate snapshots into component-object locators following `AGENTS.md`.
- Never paste secrets from MCP/GitHub into files; credentials come only from `config/env/*.env` via `@config/environments`.
