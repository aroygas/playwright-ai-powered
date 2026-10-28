# playground

Minimal React + Vite app: the single source of components and Vite config for component tests. Run it standalone with `npm run playground:dev` (http://localhost:5173) so Playwright MCP / agents can explore components live.

- `vite.config.ts` — plugins and aliases (`@playground`, `@ui`, `@utils`); reused by `playwright-ct.config.ts` as `ctViteConfig`. Keep aliases in sync with `tsconfig.json` `paths`. Do not set `root` here (CT sets its own).
- `src/components/` — sample components with ARIA roles / `data-test` ids. `AppHeader` and `LoginForm` mirror saucedemo's markup so the same `Header` / `Form` component objects drive both.
- `src/providers.tsx` — theme + router + query providers; `HooksConfig` is the `hooksConfig` type for `mount()`.

CT props cross a process boundary: callbacks work (async), functions that must return values synchronously (e.g. `render` props) do not. Wrap such components in a story component inside `src/components/`.
