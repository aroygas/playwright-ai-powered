# src/api

API layer. Services return data, specs assert. Import via `@api/*`.

- `client/ApiClient.ts` — typed wrapper over `APIRequestContext`: auth header injection, `ApiResponse<T>`, redacted request/response log attached to the report.
- `services/` — one thin class per domain (`BookingService`, `AuthService`); no assertions.
- `schemas/` — zod schemas + `expectSchema(schema, data, label)` for readable contract errors.
