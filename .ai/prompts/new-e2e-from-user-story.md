# Prompt: new E2E spec from a user story

**Read first:** `AGENTS.md`, `tests/e2e/smoke.spec.ts`, `tests/e2e/checkout.spec.ts`, `.ai/templates/spec.ts.md`.

## Input

> As a logged-in user I can add a product to the cart and see the cart badge update. Data for checkout comes from the API.

## Steps

1. Map each step to an existing page/component method; add missing methods to the object (never inline locators in the spec).
2. Pick the role with `test.use({ role: 'user' })`; no login steps.
3. Create test data with `createBooking` / factories, never by hand-clicking.
4. Tag from `TAGS` (`smoke` for critical path, `regression` otherwise); assert with web-first assertions.

## Expected output (pattern from `tests/e2e/smoke.spec.ts`)

```ts
import { test, expect } from '@fixtures';
import { TAGS } from '@utils/tags';

test.describe('inventory as a logged-in user', () => {
  test.use({ role: 'user' });

  test('cart badge follows add/remove', { tag: [TAGS.smoke] }, async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await expect(inventoryPage.header).toHaveCartCount(0);

    await inventoryPage.addToCart('Sauce Labs Backpack');
    await expect(inventoryPage.header).toHaveCartCount(1);
  });
});
```

For larger stories use the planner agent first (plan in `specs/`), then the generator.
