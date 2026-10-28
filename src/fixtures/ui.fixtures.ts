import { CheckoutPage } from '@ui/pages/CheckoutPage';
import { InventoryPage } from '@ui/pages/InventoryPage';
import { LoginPage } from '@ui/pages/LoginPage';
import { test as base } from './base';

type UiFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  checkoutPage: CheckoutPage;
};

/** Page objects are built lazily: a fixture only runs when a test destructures it. */
export const test = base.extend<UiFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});
