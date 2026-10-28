import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

export type Theme = 'light' | 'dark';

/** Shape of `hooksConfig` accepted by `mount()` in CT specs (see playwright/index.tsx). */
export type HooksConfig = { theme?: Theme; route?: string };

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({
  initial = 'light',
  children,
}: {
  initial?: Theme;
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>(initial);
  const value = useMemo(
    () => ({ theme, toggle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')) }),
    [theme],
  );
  return (
    <ThemeContext.Provider value={value}>
      <div className="app-shell" data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/** Theme + router + query client. Shared by the standalone app and by CT's `beforeMount`. */
export function AppProviders({
  hooksConfig = {},
  children,
}: {
  hooksConfig?: HooksConfig;
  children: ReactNode;
}) {
  // Fresh client per mount: no cache leaks between tests, no retries to slow failure cases.
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[hooksConfig.route ?? '/']}>
        <ThemeProvider initial={hooksConfig.theme}>{children}</ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
