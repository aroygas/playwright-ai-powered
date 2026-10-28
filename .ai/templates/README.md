# .ai/templates

Copy-and-rename code templates (stored as `.md` so lint/typecheck ignore them). Replace `<Name>` placeholders; see `AGENTS.md` for rules.

- `component.ts.md` → `src/ui/components/<Name>.ts`
- `page.ts.md` → `src/ui/pages/<Name>Page.ts`
- `service.ts.md` → `src/api/services/<Name>Service.ts`
- `spec.ts.md` → `tests/e2e/<feature>.spec.ts`
- `ct-spec.tsx.md` → `tests/component/<name>.spec.tsx`

A generator (plop) is intentionally not included to avoid an extra dependency; agents copy templates directly.
