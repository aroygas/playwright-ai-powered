import { test, expect } from '@playwright/experimental-ct-react';
import { Counter } from '@playground/components/Counter';
import { PriceTable } from '@playground/components/PriceTable';
import type { HooksConfig } from '@playground/providers';

// Screenshot the component's own element (the mount root wrapper has no box). Baselines are platform-specific (`-win32`/`-linux` suffix). Docker-only baselines: roadmap P8.2.
test.describe('visual snapshots', () => {
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
