import { test, expect } from '@playwright/experimental-ct-react';
import { Counter } from '@playground/components/Counter';
import { TAGS } from '@utils/tags';

test.describe('Counter props', () => {
  test('renders label and initial value', { tag: [TAGS.smoke] }, async ({ mount }) => {
    const component = await mount(<Counter label="Seats" initial={3} />);

    await expect(component.getByRole('heading', { name: 'Seats' })).toBeVisible();
    await expect(component.getByTestId('counter-value')).toHaveText('3');
  });

  test('falls back to defaults', async ({ mount }) => {
    const component = await mount(<Counter />);

    await expect(component.getByRole('heading', { name: 'Counter' })).toBeVisible();
    await expect(component.getByTestId('counter-value')).toHaveText('0');
  });
});

test.describe('Counter events', () => {
  test('reports every change through onChange', async ({ mount }) => {
    const changes: number[] = [];
    const component = await mount(<Counter initial={1} onChange={(v) => changes.push(v)} />);

    await component.getByRole('button', { name: 'Increment' }).click();
    await component.getByRole('button', { name: 'Increment' }).click();
    await component.getByRole('button', { name: 'Decrement' }).click();

    await expect(component.getByTestId('counter-value')).toHaveText('2');
    await expect.poll(() => changes).toEqual([2, 3, 2]);
  });
});
