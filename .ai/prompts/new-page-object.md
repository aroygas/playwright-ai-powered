# Prompt: new page object

**Read first:** `AGENTS.md`, `src/ui/pages/BasePage.ts`, `.ai/templates/page.ts.md`.

## Input

> Add a Page Object for the saucedemo cart page (`/cart.html`). It lists items, has a "Checkout" button and a way to remove an item.

## Steps

1. Explore the page with the `playwright` MCP; take handles from the accessibility snapshot (role/name or `data-test`).
2. Reuse existing components (`Header`, `Table`, ...) instead of duplicating locators.
3. Create `src/ui/pages/CartPage.ts` extending `BasePage`; register a lazy `cartPage` fixture in `src/fixtures/ui.fixtures.ts`.
4. Add a spec proving it (tag from `TAGS`), then run `npm run ai:check`.

## Expected output (pattern from `src/ui/pages/InventoryPage.ts`)

```ts
import { expect } from '@playwright/test';
import { step } from '@utils/step';
import { Header } from '../components/Header';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly path = '/cart.html';
  readonly header = new Header(this.page.getByTestId('primary-header'));
  readonly items = this.page.getByTestId('inventory-item');

  async isLoaded() {
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  @step()
  async checkout() {
    await this.page.getByRole('button', { name: 'Checkout' }).click();
  }
}
```

Anti-patterns to reject: `page.locator('.cart_item')`, `waitForTimeout`, assertions without the `expectX` name inside helpers, specs importing `@playwright/test`.
