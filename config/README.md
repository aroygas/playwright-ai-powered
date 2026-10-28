# config

Environment configuration. `env/<TEST_ENV>.env` hold non-secret defaults; `environments.ts` validates them with zod and exports the single typed `env` object. Never hardcode URLs, timeouts or credentials elsewhere. Secrets come from process env / CI secrets.
