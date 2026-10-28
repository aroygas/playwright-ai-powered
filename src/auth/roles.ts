import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '@config/environments';
import type { Credentials } from '@config/environments';

export const ROLES = { admin: 'admin', user: 'user', guest: 'guest' } as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];
export type AuthenticatedRole = Exclude<Role, 'guest'>;

export const AUTHENTICATED_ROLES: AuthenticatedRole[] = [ROLES.admin, ROLES.user];

export const AUTH_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '.auth',
);

export const isAuthenticated = (role: Role): role is AuthenticatedRole => role !== ROLES.guest;

/** Credentials for the web login form / the API auth endpoint. Source: validated env only. */
export function getCredentials(role: AuthenticatedRole, channel: 'ui' | 'api'): Credentials {
  return env.auth.roles[role][channel];
}

/** Playwright storageState file for a role. Guests have none (anonymous context). */
export const storageStatePath = (role: AuthenticatedRole) => path.join(AUTH_DIR, `${role}.json`);

/** Cached API token file for a role (same `.auth/` source and TTL as storageState). */
export const tokenPath = (role: AuthenticatedRole) => path.join(AUTH_DIR, `${role}.token.json`);

/** Per-worker storageState (worker-scoped accounts). */
export const workerStorageStatePath = (parallelIndex: number) =>
  path.join(AUTH_DIR, `worker-${parallelIndex}.json`);
