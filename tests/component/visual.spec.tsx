import { test, expect } from '@playwright/experimental-ct-react';
import { Counter } from '@playground/components/Counter';
import { PriceTable } from '@playground/components/PriceTable';
import type { HooksConfig } from '@playground/providers';

// Screenshot the component's own element (the mount root wrapper has no box). Baselines are Linux-only and
// generated in Docker (`npm run test:ct:update`), so these specs are skipped on other OSes. See docs/QUALITY.md.
test.describe('visual snapshots', () => {
  // eslint-disable-next-line playwright/no-skipped-test -- baselines exist for Linux only; documented in docs/QUALITY.md
  test.skip(
    process.platform !== 'linux' && !process.env.FORCE_VISUAL,
    'Visual baselines are Linux-only (Docker/CI); set FORCE_VISUAL=1 to compare anyway',
  );

  test('Counter, light theme', async ({ mount }) => {
    const component = await mount(<Counter label="Seats" initial={5} />);

    await expect(component.getByRole('region', { name: 'Seats' })).toHaveScreenshot(
      'counter-light.png',
    );
  });

  test('Counter, dark theme', async ({ mount }) => {
    const component = await mount<HooksConfig>(<Counter label="Seats" initial={5} />, {
      hooksConfig: { theme: 'dark' },
    });

    await expect(component.getByRole('region', { name: 'Seats' })).toHaveScreenshot(
      'counter-dark.png',
    );
  });

  test('DataTable', async ({ mount }) => {
    const component = await mount(<PriceTable />);

    await expect(component.getByRole('table')).toHaveScreenshot('data-table.png');
  });
});
