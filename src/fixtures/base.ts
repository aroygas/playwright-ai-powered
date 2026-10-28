import { test as base } from '@playwright/test';
import { ROLES } from '@auth/roles';
import type { Role } from '@auth/roles';

export { expect } from '@playwright/test';

export type RoleOptions = {
  /** Role the default `page`/`context` and `apiClient` act as. Set with `test.use({ role })`. */
  role: Role;
};

/** Shared base: declares the `role` option used by both auth and api fixtures. */
export const test = base.extend<RoleOptions>({
  role: [ROLES.guest, { option: true }],
});
