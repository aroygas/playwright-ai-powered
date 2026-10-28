import { faker } from '@faker-js/faker';
import type { Booking } from '@api/schemas/booking';

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Builds a valid random booking. Pass overrides for the fields the test cares about. */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const checkin = faker.date.soon({ days: 30 });
  const checkout = faker.date.soon({ days: 10, refDate: checkin });
  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 50, max: 1000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: { checkin: isoDay(checkin), checkout: isoDay(checkout) },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Parking', 'Late checkout']),
    ...overrides,
  };
}
