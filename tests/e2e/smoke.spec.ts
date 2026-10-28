import { test, expect } from '@playwright/test';
import { TAGS } from '@utils/tags';

test.describe('login page', () => {
  test('renders the login form', { tag: [TAGS.smoke] }, async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});
