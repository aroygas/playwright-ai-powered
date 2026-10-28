# playwright

CT mount entry (`index.html` + `index.tsx`). `beforeMount` wraps every mounted component in `AppProviders` (theme, router, query); tune per test with `mount(<X />, { hooksConfig: { theme: 'dark', route: '/cart' } })`. `.cache/` is generated and gitignored.
