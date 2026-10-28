import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { step } from '@utils/step';
import { Header } from '../components/Header';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly path = '/inventory.html';
  readonly header = new Header(this.page.getByTestId('primary-header'));
  readonly items = this.page.getByTestId('inventory-item');

  async isLoaded() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.items.first()).toBeVisible();
  }

  item(name: string): Locator {
    return this.items.filter({ hasText: name });
  }

  @step()
  async addToCart(name: string) {
    await this.item(name)
      .getByRole('button', { name: /add to cart/i })
      .click();
  }

  @step()
  async removeFromCart(name: string) {
    await this.item(name)
      .getByRole('button', { name: /remove/i })
      .click();
  }
}
