# src/fixtures

Playwright fixtures. Specs import `{ test, expect }` only from `@fixtures` (`index.ts` merges auth + api + ui and exports `expect` extended with the custom matchers).

- `base.ts` — declares the `role` option (`test.use({ role })`).
- `auth.fixtures.ts` — `asRole`, `workerPage`, role-aware `storageState`.
- `api.fixtures.ts` — `apiClient` (acts as `role`), `adminApiClient`, `bookingService`, `cleanup`, `createBooking` (auto-deleted after the test).
- `ui.fixtures.ts` — lazily built page objects: `loginPage`, `inventoryPage`, `checkoutPage` (bound to the role-aware `page`).
- `matchers.ts` — `expect.extend` matchers over component objects: `toHaveCartCount(header, n)`, `toHaveRowCount(table, n)`. Both poll.

Component tests (`tests/component`) use the CT `test`/`expect` from `@playwright/experimental-ct-react`, not these fixtures.
