# CI/CD, Docker, Allure (Phase 7)

Quality gates (flaky gate, quarantine, visual baselines): see `docs/QUALITY.md`.

## Docker
`docker/Dockerfile` uses `mcr.microsoft.com/playwright:v1.62.1-noble`. The tag **must equal** the pinned `@playwright/test` version; bump both together (see ROADMAP "Playwright version lock").

```bash
npm run docker:build
docker compose -f docker/docker-compose.yml --env-file config/env/local.env run --rm tests --project=api
```
Env comes from `--env-file`/host environment (never baked into the image). Reports are written to host volumes (`blob-report`, `test-results`, `playwright-report`, `allure-results`).

## Pipelines
| File | Trigger | What |
| --- | --- | --- |
| `.github/workflows/pr.yml` | PR | lint/typecheck/format/list → CT ∥ API ∥ E2E smoke (chromium, shard 1/4..4/4) ∥ flaky gate (changed specs ×5) → merge blobs → artifact |
| `.github/workflows/nightly.yml` | cron 02:00 UTC, `workflow_dispatch` (`test_env`, `include_quarantine`) | all browsers × 2 shards + API + CT → merged HTML/JSON/Allure, history pushed to `gh-pages` |
| `.gitlab-ci.yml` | MR, schedule, default branch | mirror using `parallel: 4` / `matrix`, Allure artifacts, history via cache |

Shards write `blob` reports (unique names via `PLAYWRIGHT_BLOB_OUTPUT_NAME`); `npm run report:merge` uses `playwright.merge.config.ts` to produce `playwright-report/` (HTML), `merged-report/results.json` (machine-readable, for healer agents) and `allure-results/`.

## Allure
- Reporter options live in `config/allure.ts` (environment info, failure categories). Local runs also emit `allure-results/`.
- `npm run report:allure` builds `allure-report/` (config `allurerc.mjs`, history in `allure-history/history.jsonl`); `npm run report:allure:open` serves it.
- API request/response logs (ApiClient attachments) and traces appear as attachments in the report.

## Secrets, caching, quarantine
- **Secrets:** set `ADMIN_UI_*`, `ADMIN_API_*`, `USER_UI_*`, `USER_API_*`, `WORKER_ACCOUNTS` as GitHub secrets / masked GitLab variables. They map 1:1 to process env, which wins over `config/env/*.env`. Unset → committed demo defaults. Optional `TEST_ENV` repo variable. Never echo secrets or put them in `environmentInfo`.
- **Caching:** npm via `actions/setup-node` cache, browsers via `actions/cache` keyed by Playwright version (`.github/actions/setup`); GitLab caches `.npm/`.
- **Quarantine:** tag a flaky test with `TAGS.quarantine` (`@quarantine`) plus a tracking issue. It is excluded from all runs (`grepInvert`); run with `npm run test:quarantine` (nightly: `include_quarantine` input, non-blocking).
