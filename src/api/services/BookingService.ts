import type { ApiClient } from '@api/client/ApiClient';
import type { Booking, BookingIds, CreatedBooking } from '@api/schemas/booking';

export type BookingFilter = {
  firstname?: string;
  lastname?: string;
  checkin?: string;
  checkout?: string;
};

/** Thin wrapper over /booking. Returns responses; never asserts. */
export class BookingService {
  constructor(private readonly client: ApiClient) {}

  list(filter: BookingFilter = {}) {
    return this.client.get<BookingIds>('/booking', { params: filter });
  }
  get(id: number) {
    return this.client.get<Booking>(`/booking/${id}`);
  }
  create(booking: Booking) {
    return this.client.post<CreatedBooking>('/booking', { data: booking });
  }
  update(id: number, booking: Booking) {
    return this.client.put<Booking>(`/booking/${id}`, { data: booking });
  }
  partialUpdate(id: number, changes: Partial<Booking>) {
    return this.client.patch<Booking>(`/booking/${id}`, { data: changes });
  }
  delete(id: number) {
    return this.client.delete<string>(`/booking/${id}`);
  }
}
