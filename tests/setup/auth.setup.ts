import { existsSync } from 'node:fs';
import { test as setup, expect } from '@playwright/test';
import { AUTHENTICATED_ROLES, getCredentials, storageStatePath } from '@auth/roles';
import { getApiToken } from '@auth/session';
import { refreshStorageState } from '@auth/login';

// One setup test per role. Each skips the UI login while its storageState is still within the TTL.
for (const role of AUTHENTICATED_ROLES) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    // API-first: the token cache is refreshed through the auth endpoint (no browser needed).
    expect(await getApiToken(role)).toBeTruthy();

    // The web SUT only exposes a login form, so browser state comes from the UI login.
    const file = storageStatePath(role);
    await refreshStorageState(page, getCredentials(role, 'ui'), file);
    expect(existsSync(file)).toBe(true);
  });
}
