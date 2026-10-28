import { test, expect } from '@playwright/test';
import { TAGS } from '@utils/tags';

test(
  'restful-booker health check responds 201',
  { tag: [TAGS.api, TAGS.smoke] },
  async ({ request }) => {
    const response = await request.get('/ping');
    expect(response.status()).toBe(201);
  },
);
