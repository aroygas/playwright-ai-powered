# src/fixtures

Specs import `{ test, expect }` only from `@fixtures` (`index.ts` merges all fixture files).

- `base.ts` — `role` option (`test.use({ role })`).
- `auth.fixtures.ts` — `asRole`, `workerPage`, role-aware `storageState`.
- `api.fixtures.ts` — `apiClient`, `adminApiClient`, `bookingService`, `cleanup`, `createBooking` (auto-deleted after the test).
- `ui.fixtures.ts` — lazily built page objects: `loginPage`, `inventoryPage`, `checkoutPage`.
- `matchers.ts` — polling matchers `toHaveCartCount(header, n)`, `toHaveRowCount(table, n)`.

Component tests (`tests/component`) use their own `test`/`expect` from `@playwright/experimental-ct-react`.
