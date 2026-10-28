# src/fixtures

Playwright fixtures. Specs import `{ test, expect }` only from `@fixtures` (`index.ts` merges auth + api; ui joins in Phase 4).

- `base.ts` — declares the `role` option (`test.use({ role })`).
- `auth.fixtures.ts` — `asRole`, `workerPage`, role-aware `storageState`.
- `api.fixtures.ts` — `apiClient` (acts as `role`), `adminApiClient`, `bookingService`, `cleanup`, `createBooking` (auto-deleted after the test).
