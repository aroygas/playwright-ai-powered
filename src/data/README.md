# src/data

Test data. `factories/` = faker builders with overrides (`buildBooking`) and `CleanupRegistry` (LIFO teardown of created entities, wired into the `cleanup`/`createBooking` fixtures). `static/` = fixed fixtures. Import via `@data/*`.
