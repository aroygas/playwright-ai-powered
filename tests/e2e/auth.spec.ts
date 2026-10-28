import { test, expect } from '@fixtures';
import { TAGS } from '@utils/tags';

test.describe('authenticated as a role', () => {
  test.use({ role: 'user' });

  test('starts logged in without a login step', { tag: [TAGS.smoke] }, async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByRole('button', { name: 'Open Menu' })).toBeVisible();
  });
});

test('guest is redirected away from protected pages', async ({ page }) => {
  await page.goto('/inventory.html');
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});

test('two roles in one test use isolated contexts', async ({ asRole }) => {
  const admin = await asRole('admin');
  const guest = await asRole('guest');
  await admin.page.goto('/inventory.html');
  await guest.page.goto('/inventory.html');
  await expect(admin.page.getByRole('button', { name: 'Open Menu' })).toBeVisible();
  await expect(guest.page.getByRole('button', { name: 'Login' })).toBeVisible();
});

test('worker-scoped account is logged in', async ({ workerPage }) => {
  await workerPage.goto('/inventory.html');
  await expect(workerPage.getByRole('button', { name: 'Open Menu' })).toBeVisible();
});
