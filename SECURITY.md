# Security policy

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub's [private vulnerability reporting](https://github.com/aroygas/PlaywrightAIpowered/security/advisories/new) (repository **Security** tab → **Report a vulnerability**). Do not open a public issue for security problems.

You can expect an acknowledgement within a few days. This is a test-automation template maintained on a best-effort basis, so there is no fixed fix-time guarantee.

## Supported versions

Only the latest `main` is supported. Fixes are not backported.

## Scope and notes

- The committed `config/env/*.env` files contain the **public** credentials of the demo sites (saucedemo.com, restful-booker). They are not secrets. Real credentials belong in CI secrets or a gitignored `.env`, never in the repository.
- `npm audit` is kept clean. The Allure report generator pulled in a vulnerable `dompurify`; `package.json` overrides it to a patched version. Remove the override once `allure` ships a fixed dependency.
