# Prompt: new Component Test spec

**Read first:** `AGENTS.md`, `tests/component/counter.spec.tsx`, `tests/component/booking-list.spec.tsx`, `.ai/templates/ct-spec.tsx.md`.

## Input

> Cover the `Counter` component: props, `onChange` events.

## Steps

1. Import `test, expect` from `@playwright/experimental-ct-react`, the component from `@playground/components/...`.
2. `mount(<Component .../>)`; query the result with `getByRole` / `getByTestId` (or wrap with a shared `@ui/components` object).
3. Callbacks: collect into an array and assert with `expect.poll`. Network: `router.route` or `router.use(http...)`.
4. Tag from `TAGS`; run `npm run test:ct`.

## Expected output (from `tests/component/counter.spec.tsx`)

```tsx
test('reports every change through onChange', async ({ mount }) => {
  const changes: number[] = [];
  const component = await mount(<Counter initial={1} onChange={(v) => changes.push(v)} />);

  await component.getByRole('button', { name: 'Increment' }).click();
  await component.getByRole('button', { name: 'Decrement' }).click();

  await expect(component.getByTestId('counter-value')).toHaveText('1');
  await expect.poll(() => changes).toEqual([2, 1]);
});
```

Visual snapshots are `-win32` only; do not add baselines for other OSes.
