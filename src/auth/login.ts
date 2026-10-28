import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { Credentials } from '@config/environments';
import { ensureDirFor, isFresh } from './session';

/** UI login used by the setup project and worker-scoped accounts. Specs must not call this. */
export async function loginViaUi(page: Page, { username, password }: Credentials) {
  await page.goto('/');
  await page.getByTestId('username').fill(username);
  await page.getByTestId('password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory\.html/);
}

/** Writes `file` via UI login unless it is still within the TTL. Returns true when it logged in. */
export async function refreshStorageState(
  page: Page,
  credentials: Credentials,
  file: string,
): Promise<boolean> {
  if (isFresh(file)) return false;
  await loginViaUi(page, credentials);
  ensureDirFor(file);
  await page.context().storageState({ path: file });
  return true;
}
