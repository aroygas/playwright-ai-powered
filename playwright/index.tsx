import { beforeMount } from '@playwright/experimental-ct-react/hooks';
import { AppProviders } from '@playground/providers';
import type { HooksConfig } from '@playground/providers';
import '@playground/styles.css';

// Every mounted component gets theme + router + query providers. Tune per test:
//   mount(<X />, { hooksConfig: { theme: 'dark', route: '/cart' } })
beforeMount<HooksConfig>(async ({ App, hooksConfig }) => (
  <AppProviders hooksConfig={hooksConfig}>
    <App />
  </AppProviders>
));
