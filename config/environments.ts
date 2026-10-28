import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

export const ENV_NAMES = ['local', 'dev', 'staging', 'prod'] as const;
export type EnvName = (typeof ENV_NAMES)[number];

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const timeout = z.coerce.number().int().positive();

const credential = z.string().min(1);

const schema = z.object({
  TEST_ENV: z.enum(ENV_NAMES),
  BASE_URL: z.url(),
  API_URL: z.url(),
  TEST_TIMEOUT_MS: timeout,
  EXPECT_TIMEOUT_MS: timeout,
  ACTION_TIMEOUT_MS: timeout,
  NAVIGATION_TIMEOUT_MS: timeout,
  AUTH_TTL_MINUTES: z.coerce.number().positive().default(30),
  ADMIN_UI_USERNAME: credential,
  ADMIN_UI_PASSWORD: credential,
  ADMIN_API_USERNAME: credential,
  ADMIN_API_PASSWORD: credential,
  USER_UI_USERNAME: credential,
  USER_UI_PASSWORD: credential,
  USER_API_USERNAME: credential,
  USER_API_PASSWORD: credential,
  // Pool for worker-scoped accounts: "user:pass,user2:pass2" (one per parallel worker).
  WORKER_ACCOUNTS: z
    .string()
    .default('')
    .transform((v, ctx) =>
      v
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean)
        .map((a) => {
          const i = a.indexOf(':');
          if (i < 1 || i === a.length - 1) {
            ctx.addIssue({ code: 'custom', message: 'Expected "username:password" entries' });
            return { username: '', password: '' };
          }
          return { username: a.slice(0, i), password: a.slice(i + 1) };
        }),
    ),
  FEATURE_FLAGS: z
    .string()
    .default('')
    .transform((v) =>
      v
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
    ),
});

export type Credentials = { username: string; password: string };

export type Env = {
  name: EnvName;
  baseURL: string;
  apiURL: string;
  timeouts: { test: number; expect: number; action: number; navigation: number };
  featureFlags: string[];
  auth: {
    ttlMinutes: number;
    /** Credentials per authenticated role; `ui` is for the web login form, `api` for the auth endpoint. */
    roles: Record<'admin' | 'user', { ui: Credentials; api: Credentials }>;
    workerAccounts: Credentials[];
  };
};

/** Loads and validates the environment. Throws a readable error listing every bad/missing var. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const name = source.TEST_ENV ?? 'local';
  if (!(ENV_NAMES as readonly string[]).includes(name)) {
    throw new Error(`Invalid TEST_ENV "${name}". Expected one of: ${ENV_NAMES.join(', ')}`);
  }
  const envFile = path.join(rootDir, 'config', 'env', `${name}.env`);
  if (!existsSync(envFile)) {
    throw new Error(`Missing env file: ${envFile}`);
  }
  // Precedence (dotenv never overrides): process env > .env > config/env/<name>.env
  const merged: NodeJS.ProcessEnv = { ...source };
  for (const file of [path.join(rootDir, '.env'), envFile]) {
    if (!existsSync(file)) continue;
    const parsed = dotenv.parse(readFileSync(file, 'utf8'));
    for (const [k, v] of Object.entries(parsed)) merged[k] ??= v;
  }
  merged.TEST_ENV = name;

  const result = schema.safeParse(merged);
  if (!result.success) {
    throw new Error(
      `Invalid environment configuration (TEST_ENV=${name}):\n${z.prettifyError(result.error)}`,
    );
  }
  const v = result.data;
  return {
    name: v.TEST_ENV,
    baseURL: v.BASE_URL,
    apiURL: v.API_URL,
    timeouts: {
      test: v.TEST_TIMEOUT_MS,
      expect: v.EXPECT_TIMEOUT_MS,
      action: v.ACTION_TIMEOUT_MS,
      navigation: v.NAVIGATION_TIMEOUT_MS,
    },
    featureFlags: v.FEATURE_FLAGS,
    auth: {
      ttlMinutes: v.AUTH_TTL_MINUTES,
      roles: {
        admin: {
          ui: { username: v.ADMIN_UI_USERNAME, password: v.ADMIN_UI_PASSWORD },
          api: { username: v.ADMIN_API_USERNAME, password: v.ADMIN_API_PASSWORD },
        },
        user: {
          ui: { username: v.USER_UI_USERNAME, password: v.USER_UI_PASSWORD },
          api: { username: v.USER_API_USERNAME, password: v.USER_API_PASSWORD },
        },
      },
      workerAccounts: v.WORKER_ACCOUNTS,
    },
  };
}

/** The single typed source of URLs, timeouts and flags. Never hardcode these elsewhere. */
export const env: Env = loadEnv();
