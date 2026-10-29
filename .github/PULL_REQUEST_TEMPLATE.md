## What and why

<!-- One or two sentences. Link the issue if there is one. -->

## Checklist (mirrors the Definition of Done in AGENTS.md)

- [ ] `npm run ai:check` is green
- [ ] New behaviour has at least one test proving it, tagged from `TAGS`
- [ ] No golden rule violated (no sleeps, raw locators, hardcoded URLs/credentials; fixtures-only imports)
- [ ] `AGENTS.md` and folder READMEs updated if a pattern changed
- [ ] Visual baselines, if touched, were regenerated with `npm run test:ct:update` and the PNG diff reviewed
- [ ] Playwright packages were not bumped individually (see `docs/DESIGN.md`)
