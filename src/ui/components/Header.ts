import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

/** Application header: menu button and cart link with an item badge. */
export class Header extends BaseComponent {
  readonly menuButton = this.byRole('button', { name: 'Open Menu' });
  readonly cartLink = this.byTestId('shopping-cart-link');
  private readonly cartBadge = this.byTestId('shopping-cart-badge');

  async openCart() {
    await this.cartLink.click();
  }

  /** Items in the cart; an absent badge means 0. */
  async cartCount(): Promise<number> {
    if ((await this.cartBadge.count()) === 0) return 0;
    return Number(await this.cartBadge.innerText());
  }

  async expectCartCount(expected: number) {
    if (expected === 0) await expect(this.cartBadge).toBeHidden();
    else await expect(this.cartBadge).toHaveText(String(expected));
  }

  get cartBadgeLocator(): Locator {
    return this.cartBadge;
  }
}
