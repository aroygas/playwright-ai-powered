import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { request } from '@playwright/test';
import { ApiClient } from '@api/client/ApiClient';
import { AuthTokenSchema } from '@api/schemas/auth';
import { expectSchema } from '@api/schemas/validate';
import { AuthService } from '@api/services/AuthService';
import { env } from '@config/environments';
import { getCredentials, tokenPath } from './roles';
import type { AuthenticatedRole } from './roles';

/** True when `file` exists and was written within the configured TTL. */
export function isFresh(file: string): boolean {
  try {
    return Date.now() - statSync(file).mtimeMs < env.auth.ttlMinutes * 60_000;
  } catch {
    return false;
  }
}

export function ensureDirFor(file: string) {
  mkdirSync(path.dirname(file), { recursive: true });
}

/** Logs in through the API and caches the token under `.auth/` (TTL-aware). */
export async function getApiToken(role: AuthenticatedRole): Promise<string> {
  const file = tokenPath(role);
  if (isFresh(file)) {
    try {
      const cached = expectSchema(AuthTokenSchema, JSON.parse(readFileSync(file, 'utf8')));
      return cached.token;
    } catch {
      // Corrupt or partially written cache: fall through and log in again.
    }
  }
  const context = await request.newContext({ baseURL: env.apiURL });
  try {
    const { username, password } = getCredentials(role, 'api');
    const res = await new AuthService(new ApiClient(context)).login(username, password);
    const { token } = expectSchema(AuthTokenSchema, res.data, `API login for role "${role}"`);
    ensureDirFor(file);
    writeFileSync(file, JSON.stringify({ token }));
    return token;
  } finally {
    await context.dispose();
  }
}
