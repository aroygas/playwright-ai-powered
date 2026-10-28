import { test, expect } from '@playwright/experimental-ct-react';
import { http, HttpResponse } from 'msw';
import { BookingList } from '@playground/components/BookingList';
import { Table } from '@ui/components/Table';
import { TAGS } from '@utils/tags';

const bookings = [
  { id: 1, firstname: 'Ada', lastname: 'Lovelace', totalprice: 120 },
  { id: 2, firstname: 'Alan', lastname: 'Turing', totalprice: 340 },
];

test.describe('BookingList network mocking', () => {
  test(
    'renders rows from a router.route mock',
    { tag: [TAGS.smoke] },
    async ({ mount, router }) => {
      await router.route('**/api/bookings', (route) => route.fulfill({ json: bookings }));

      const table = new Table((await mount(<BookingList />)).getByRole('table'));

      await table.expectRowCount(2);
      await table.expectCell('Ada', 'Price', '120');
      await table.expectCell(/Turing/, 'Guest', 'Alan Turing');
    },
  );

  test('renders rows from an MSW handler via router.use', async ({ mount, router }) => {
    await router.use(http.get('/api/bookings', () => HttpResponse.json(bookings.slice(0, 1))));

    const table = new Table((await mount(<BookingList />)).getByRole('table'));

    await table.expectRowCount(1);
    await table.expectCell('Lovelace', 'Price', '120');
  });

  test('shows the empty state', async ({ mount, router }) => {
    await router.use(http.get('/api/bookings', () => HttpResponse.json([])));

    const component = await mount(<BookingList />);

    await expect(component.getByText('No bookings yet')).toBeVisible();
  });

  test('surfaces server errors', async ({ mount, router }) => {
    await router.use(http.get('/api/bookings', () => new HttpResponse(null, { status: 500 })));

    const component = await mount(<BookingList />);

    await expect(component.getByRole('alert')).toHaveText('Failed to load bookings (500)');
  });
});
