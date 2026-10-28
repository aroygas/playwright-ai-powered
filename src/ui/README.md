# src/ui

UI layer. `components/` = Component Objects scoped to a root Locator, `pages/` = Page Objects composed from components. Locators: getByRole > getByLabel > getByTestId only; no `page.locator()`, CSS or XPath (lint-enforced). Import via `@ui/*`.
