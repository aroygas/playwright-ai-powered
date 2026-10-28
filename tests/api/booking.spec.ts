import { test, expect } from '@fixtures';
import { BookingIdsSchema, BookingSchema, CreatedBookingSchema } from '@api/schemas/booking';
import { expectSchema } from '@api/schemas/validate';
import { buildBooking } from '@data/factories/bookingFactory';
import { TAGS } from '@utils/tags';

test.describe('booking CRUD', { tag: [TAGS.api] }, () => {
  test.use({ role: 'admin' });

  test('creates a booking', { tag: [TAGS.smoke] }, async ({ bookingService, cleanup }) => {
    const payload = buildBooking({ firstname: 'Ada' });
    const res = await bookingService.create(payload);
    expect(res.status).toBe(200);
    const created = expectSchema(CreatedBookingSchema, res.data);
    cleanup.register(`delete booking ${created.bookingid}`, () =>
      bookingService.delete(created.bookingid),
    );
    expect(created.booking).toMatchObject({ firstname: 'Ada', lastname: payload.lastname });
  });

  test('reads a booking by id', async ({ bookingService, createBooking }) => {
    const { bookingid, booking } = await createBooking();
    const res = await bookingService.get(bookingid);
    expect(res.status).toBe(200);
    expect(expectSchema(BookingSchema, res.data)).toEqual(booking);
  });

  test('lists bookings filtered by name', async ({ bookingService, createBooking }) => {
    const { bookingid } = await createBooking({ lastname: 'Lovelace-Filter' });
    const res = await bookingService.list({ lastname: 'Lovelace-Filter' });
    expect(res.status).toBe(200);
    expect(expectSchema(BookingIdsSchema, res.data)).toContainEqual({ bookingid });
  });

  test('updates a booking', async ({ bookingService, createBooking }) => {
    const { bookingid } = await createBooking();
    const updated = buildBooking({ firstname: 'Grace' });
    const res = await bookingService.update(bookingid, updated);
    expect(res.status).toBe(200);
    expect(expectSchema(BookingSchema, res.data).firstname).toBe('Grace');
  });

  test('partially updates a booking', async ({ bookingService, createBooking }) => {
    const { bookingid, booking } = await createBooking();
    const res = await bookingService.partialUpdate(bookingid, { totalprice: 1 });
    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({ ...booking, totalprice: 1 });
  });

  test('deletes a booking', async ({ bookingService, createBooking }) => {
    const { bookingid } = await createBooking();
    expect((await bookingService.delete(bookingid)).status).toBe(201);
    expect((await bookingService.get(bookingid)).status).toBe(404);
  });
});

test.describe('booking negative cases', { tag: [TAGS.api] }, () => {
  test('returns 404 for an unknown booking', async ({ bookingService }) => {
    const res = await bookingService.get(999_999_999);
    expect(res.status).toBe(404);
  });

  test('rejects a malformed create payload', async ({ apiClient }) => {
    const res = await apiClient.post('/booking', { data: { firstname: 'only-this' } });
    expect(res.ok).toBe(false);
  });

  test('rejects update without auth', async ({ bookingService, createBooking }) => {
    // Default role is guest: no token is sent.
    const { bookingid } = await createBooking();
    const res = await bookingService.update(bookingid, buildBooking());
    expect(res.status).toBe(403);
  });
});

test.describe('booking contract', { tag: [TAGS.api] }, () => {
  test('schema helper reports readable contract errors', async ({
    createBooking,
    bookingService,
  }) => {
    const { bookingid } = await createBooking();
    const res = await bookingService.get(bookingid);
    const broken = { ...(res.data as object), totalprice: 'free' };
    expect(() => expectSchema(BookingSchema, broken, 'GET /booking/:id')).toThrow(
      /Schema contract violation in GET \/booking\/:id[\s\S]*totalprice/,
    );
  });
});
