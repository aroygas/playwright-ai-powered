import { ApiClient } from '@api/client/ApiClient';
import { BookingService } from '@api/services/BookingService';
import { CreatedBookingSchema } from '@api/schemas/booking';
import type { Booking, CreatedBooking } from '@api/schemas/booking';
import { expectSchema } from '@api/schemas/validate';
import { env } from '@config/environments';
import { isAuthenticated, ROLES } from '@auth/roles';
import type { Role } from '@auth/roles';
import { getApiToken } from '@auth/session';
import { buildBooking } from '@data/factories/bookingFactory';
import { CleanupRegistry } from '@data/factories/CleanupRegistry';
import { test as base } from './base';
import type { APIRequestContext } from '@playwright/test';

type ApiFixtures = {
  apiRequest: APIRequestContext;
  /** Client acting as the `role` option (guest = no token). */
  apiClient: ApiClient;
  /** Always-admin client, used for privileged setup and teardown. */
  adminApiClient: ApiClient;
  bookingService: BookingService;
  cleanup: CleanupRegistry;
  /** Creates a booking via the API; it is deleted automatically after the test. */
  createBooking: (overrides?: Partial<Booking>) => Promise<CreatedBooking>;
};

// restful-booker expects the token as a cookie on write endpoints.
const tokenCookie = (token: string) => ({ Cookie: `token=${token}` });

async function clientFor(request: APIRequestContext, role: Role): Promise<ApiClient> {
  if (!isAuthenticated(role)) return new ApiClient(request);
  return new ApiClient(request, { token: await getApiToken(role), authHeaders: tokenCookie });
}

export const test = base.extend<ApiFixtures>({
  // Own context so API fixtures work in every project (UI projects use the web baseURL).
  apiRequest: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: env.apiURL });
    await use(context);
    await context.dispose();
  },

  apiClient: async ({ apiRequest, role }, use) => {
    await use(await clientFor(apiRequest, role));
  },

  adminApiClient: async ({ apiRequest }, use) => {
    await use(await clientFor(apiRequest, ROLES.admin));
  },

  bookingService: async ({ apiClient }, use) => {
    await use(new BookingService(apiClient));
  },

  cleanup: async ({}, use) => {
    const registry = new CleanupRegistry();
    await use(registry);
    await registry.runAll();
  },

  createBooking: async ({ adminApiClient, cleanup }, use) => {
    const admin = new BookingService(adminApiClient);
    await use(async (overrides) => {
      const res = await admin.create(buildBooking(overrides));
      const created = expectSchema(CreatedBookingSchema, res.data, 'createBooking');
      cleanup.register(`delete booking ${created.bookingid}`, () =>
        admin.delete(created.bookingid),
      );
      return created;
    });
  },
});
