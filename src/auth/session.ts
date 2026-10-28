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

/** restful-booker wipes all tokens every ~10 minutes, so never trust a cached API token longer than this. */
const API_TOKEN_MAX_TTL_MINUTES = 5;

/** True when `file` was written within the TTL and no session cookie in it has expired (or is about to). */
export function isFresh(file: string, ttlMinutes = env.auth.ttlMinutes): boolean {
  try {
    if (Date.now() - statSync(file).mtimeMs >= ttlMinutes * 60_000) return false;
    const state = JSON.parse(readFileSync(file, 'utf8')) as { cookies?: { expires?: number }[] };
    const cutoff = Date.now() / 1000 + 60;
    return (state.cookies ?? []).every(
      (c) => c.expires === undefined || c.expires < 0 || c.expires > cutoff,
    );
  } catch {
    return false;
  }
}

export function ensureDirFor(file: string) {
  mkdirSync(path.dirname(file), { recursive: true });
}

/** Logs in through the API and caches the token under `.auth/` (TTL-aware). */
export async function getApiToken(role: AuthenticatedRole, forceFresh = false): Promise<string> {
  const file = tokenPath(role);
  if (!forceFresh && isFresh(file, Math.min(env.auth.ttlMinutes, API_TOKEN_MAX_TTL_MINUTES))) {
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
