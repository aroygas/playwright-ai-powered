# src/ui/components

New component: extend `BaseComponent(root: Locator)`, scope everything to `root`, keep locators as `readonly` fields or small methods, and expose assertions only as explicit `expectX()` helpers.
