# src/ui/components

Component Objects extending `BaseComponent(root: Locator)`. Everything is scoped to `root` via `byRole` / `byLabel` / `byTestId`. No assertions except explicit `expectX()` helpers.

- `BaseComponent` — root, `expectVisible()` / `expectHidden()`.
- `Header` — menu button, cart link/badge, `cartCount()`, `expectCartCount()`.
- `Form` — `field(name)` (label, then test id), `fill({...})`, `submit(buttonName)`, `expectError()`.
- `Modal` — `role="dialog"`; `Modal.on(page)`, `clickButton()`, `close()`, `expectOpen/Closed/Title()`.
- `Table` — semantic table (`thead` + `tbody`); `row()`, `cell(row, header)`, `expectRowCount()`, `expectCell()`.

New component: extend `BaseComponent`, keep locators as `readonly` fields or small methods, expose assertions only as `expectX()`.
