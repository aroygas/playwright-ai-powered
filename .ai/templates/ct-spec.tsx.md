Target: `tests/component/<name>.spec.tsx`

```tsx
import { test, expect } from '@playwright/experimental-ct-react';
import { <Component> } from '@playground/components/<Component>';
import { TAGS } from '@utils/tags';

test.describe('<Component> props', () => {
  test('renders <thing>', { tag: [TAGS.smoke] }, async ({ mount }) => {
    const component = await mount(<<Component> label="Seats" />);

    await expect(component.getByRole('heading', { name: 'Seats' })).toBeVisible();
  });
});
```
