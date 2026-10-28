import { test } from '@fixtures';
import { TAGS } from '@utils/tags';

test.describe('checkout with API-prepared data', () => {
  test.use({ role: 'user' });

  test(
    'customer details come from a booking created via the API',
    { tag: [TAGS.regression] },
    async ({ createBooking, checkoutPage }) => {
      // Data setup through the API fixture (auto-deleted after the test); the UI only consumes it.
      const { booking } = await createBooking();

      await checkoutPage.goto();
      await checkoutPage.submitCustomerInfo({
        firstName: booking.firstname,
        lastName: booking.lastname,
        postalCode: '10001',
      });
      await checkoutPage.expectOverview();
    },
  );
});
