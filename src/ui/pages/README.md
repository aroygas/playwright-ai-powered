# src/ui/pages

Page Objects extending `BasePage`: `path`, `goto()` (navigates, then `isLoaded()`), `isLoaded()` (web-first assertion on a landmark; resolves when ready). Pages compose components; no raw locators. Actions carry `@step()`.

`LoginPage`, `InventoryPage`, `CheckoutPage` — exposed as fixtures in `src/fixtures/ui.fixtures.ts`.
