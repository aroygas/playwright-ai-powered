# src/auth

Role registry and auth helpers. Specs never write login steps.

- `roles.ts` — `ROLES` (`admin | user | guest`), credentials from the validated `env` (`getCredentials(role, 'ui' | 'api')`), `.auth/` file paths.
- `session.ts` — `getApiToken(role)`: API login, cached in `.auth/<role>.token.json` (TTL = `AUTH_TTL_MINUTES`). Used by the `api` fixtures, so API tests need no setup project.
- `login.ts` — UI login + `refreshStorageState` (skips when `.auth/<role>.json` is fresh). Used only by `tests/setup/auth.setup.ts` and worker accounts.

Usage in specs (`import { test, expect } from '@fixtures'`):

- `test.use({ role: 'admin' })` — default `page`/`context` start logged in.
- `asRole('guest')` — extra isolated context, for multi-role tests.
- `workerPage` — logged in with this worker's own account (`WORKER_ACCOUNTS[parallelIndex]`), for parallel-unsafe flows.

`.auth/` is gitignored.
