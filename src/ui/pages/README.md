# src/ui/pages

Page Objects extend `BasePage`: `goto()` navigates to `path`, then awaits `isLoaded()` (a web-first assertion on a landmark that resolves when the page is ready).
