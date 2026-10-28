# src/auth

Role registry and auth helpers. Specs never write login steps.

- `roles.ts` — `ROLES` (`admin | user | guest`), credentials from the validated `env` (`getCredentials(role, 'ui' | 'api')`), `.auth/` file paths.
- `session.ts` — `getApiToken(role)`: API login, cached in `.auth/<role>.token.json` (TTL = `AUTH_TTL_MINUTES`). Used by the `api` fixtures, so API tests need no setup project.
- `login.ts` — UI login + `refreshStorageState` (skips when `.auth/<role>.json` is fresh). Used only by `tests/setup/auth.setup.ts` and worker accounts.

Usage in specs (`import { test, expect } from '@fixtures'`):

- `test.use({ role: 'admin' })` — default `page`/`context` start logged in.
- `asRole('guest')` — extra isolated context, for multi-role tests.
- `workerPage` — logged in with this worker's own account (`WORKER_ACCOUNTS[parallelIndex]`), for parallel-unsafe flows.

## Accounts

| Purpose | Env vars | Local/dev value |
| --- | --- | --- |
| `admin` role (UI) | `ADMIN_UI_USERNAME/PASSWORD` | `visual_user` |
| `user` role (UI) | `USER_UI_USERNAME/PASSWORD` | `standard_user` |
| API roles | `ADMIN_API_*`, `USER_API_*` | restful-booker `admin` |
| Worker pool | `WORKER_ACCOUNTS=user:pass,...` | `standard_user`, `problem_user`, `error_user`, `visual_user` (all `secret_sauce`; `performance_glitch_user` is excluded: its random multi-second delays flake the default 5s expect timeout) |

Worker pool rules: one account per parallel worker, never shared (a real SUT may allow a single
session per account). `playwright.config.ts` therefore hard-caps `workers` at
`WORKER_ACCOUNTS.length`; a `--workers` CLI override above that fails with a clear error.
To run more workers, add accounts. (SauceDemo itself is stateless: it only checks the
`session-username` cookie, whose ~10 min lifetime is why `isFresh` also checks cookie expiry.)

`.auth/` is gitignored.
