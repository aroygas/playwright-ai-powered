import { test, expect } from '@fixtures';
import { getCredentials } from '@auth/roles';
import { TAGS } from '@utils/tags';

test.describe('login page', () => {
  test('renders the login form', { tag: [TAGS.smoke] }, async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.form.locator).toBeVisible();
  });

  test('logs in through the UI', { tag: [TAGS.smoke] }, async ({ loginPage, inventoryPage }) => {
    const { username, password } = getCredentials('user', 'ui');
    await loginPage.goto();
    await loginPage.login(username, password);
    await inventoryPage.isLoaded();
    await expect(inventoryPage.header.menuButton).toBeVisible();
  });

  test('rejects wrong credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('nobody', 'wrong');
    await loginPage.expectError(/do not match/i);
  });
});

test.describe('inventory as a logged-in user', () => {
  test.use({ role: 'user' });

  test('cart badge follows add/remove', { tag: [TAGS.smoke] }, async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await expect(inventoryPage.header).toHaveCartCount(0);

    await inventoryPage.addToCart('Sauce Labs Backpack');
    await expect(inventoryPage.header).toHaveCartCount(1);

    await inventoryPage.removeFromCart('Sauce Labs Backpack');
    await inventoryPage.header.expectCartCount(0);
  });
});
