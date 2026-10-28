Target: `tests/e2e/<feature>.spec.ts` (API specs: `tests/api/`, import the same `@fixtures`).

```ts
import { test, expect } from '@fixtures';
import { TAGS } from '@utils/tags';

test.describe('<feature>', () => {
  test.use({ role: 'user' });

  test('<behaviour in plain words>', { tag: [TAGS.regression] }, async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await expect(inventoryPage.header).toHaveCartCount(1);
  });
});
```
