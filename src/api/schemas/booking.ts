import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Expected YYYY-MM-DD date');

export const BookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: z.object({ checkin: isoDate, checkout: isoDate }),
  additionalneeds: z.string().optional(),
});
export type Booking = z.infer<typeof BookingSchema>;

export const CreatedBookingSchema = z.object({
  bookingid: z.number().int().positive(),
  booking: BookingSchema,
});
export type CreatedBooking = z.infer<typeof CreatedBookingSchema>;

export const BookingIdsSchema = z.array(z.object({ bookingid: z.number().int().positive() }));
export type BookingIds = z.infer<typeof BookingIdsSchema>;
