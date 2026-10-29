# tests/component

Component tests (`*.spec.tsx`) run by `npm run test:ct` (`playwright-ct.config.ts`, separate from the E2E/API config).

- Import `test`/`expect` from `@playwright/experimental-ct-react`; components from `@playground/components/*`.
- Wrap `mount()` results in the shared component objects from `@ui/components/*` (same ones E2E uses).
- Mock the network with the `router` fixture: `router.route(url, handler)` or MSW `router.use(http.get(...))`.
- Screenshot the component's own element (`component.getByRole(...)`), not the mount root. Baselines live in `__snapshots__/` (no OS suffix) and are rendered in Docker only: `npm run test:ct:update`. Visual specs skip on non-Linux hosts. See `docs/QUALITY.md`.
