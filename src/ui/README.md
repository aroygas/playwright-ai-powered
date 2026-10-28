# src/ui

UI layer. `components/` = Component Objects scoped to a root Locator, `pages/` = Page Objects composed from components. Locators: getByRole > getByLabel > getByTestId only; no `page.locator()`, CSS or XPath (lint-enforced). Missing handle? Add a `data-test` to the SUT. Import via `@ui/*`. Decorate page actions with `@step()` from `@utils/step` for readable reports.

Component objects are shared between E2E (root = page region) and component tests (root = `mount()` result).
