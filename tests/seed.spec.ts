import { test, expect } from '@fixtures';

// Seed for Playwright Test Agents (planner/generator/healer): it shows the canonical setup —
// `@fixtures` import, role via test.use, page objects as fixtures. Generated specs copy this shape.
test.describe('seed', () => {
  test.use({ role: 'user' });

  test('seed', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await expect(inventoryPage.header.menuButton).toBeVisible();
  });
});
