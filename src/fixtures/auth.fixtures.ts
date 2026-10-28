import { existsSync } from 'node:fs';
import type { BrowserContext, Page } from '@playwright/test';
import { env } from '@config/environments';
import type { Credentials } from '@config/environments';
import { isAuthenticated, storageStatePath, workerStorageStatePath } from '@auth/roles';
import type { Role } from '@auth/roles';
import { loginViaUi } from '@auth/login';
import { ensureDirFor } from '@auth/session';
import { test as base } from './base';

export type RoleSession = { context: BrowserContext; page: Page };

type AuthFixtures = {
  /** Opens an isolated browser context authenticated as `role` (several roles per test are fine). */
  asRole: (role: Role) => Promise<RoleSession>;
  /** Page authenticated with this worker's dedicated account (for parallel-unsafe flows). */
  workerPage: Page;
};

type AuthWorkerFixtures = {
  workerAccount: Credentials;
  workerStorageState: string;
};

function stateFor(role: Role): string | undefined {
  if (!isAuthenticated(role)) return undefined;
  const file = storageStatePath(role);
  if (!existsSync(file)) {
    throw new Error(
      `Missing storageState for role "${role}" (${file}). Run via a project that depends on "setup".`,
    );
  }
  return file;
}

export const test = base.extend<AuthFixtures, AuthWorkerFixtures>({
  // `test.use({ role: 'admin' })` makes the built-in `page`/`context` start already logged in.
  storageState: async ({ role }, use) => {
    // Lenient on purpose: the browser-less `api` project has no setup dependency and never opens
    // a page, yet `storageState` is resolved for every test. Browser projects depend on "setup".
    const file = isAuthenticated(role) ? storageStatePath(role) : undefined;
    await use(file && existsSync(file) ? file : undefined);
  },

  asRole: async (
    { browser, baseURL, viewport, userAgent, deviceScaleFactor, isMobile, hasTouch },
    use,
  ) => {
    const contexts: BrowserContext[] = [];
    await use(async (role) => {
      const context = await browser.newContext({
        baseURL,
        viewport,
        userAgent,
        deviceScaleFactor,
        isMobile,
        hasTouch,
        storageState: stateFor(role),
      });
      contexts.push(context);
      return { context, page: await context.newPage() };
    });
    await Promise.all(contexts.map((c) => c.close()));
  },

  workerAccount: [
    async ({}, use, workerInfo) => {
      const { workerAccounts } = env.auth;
      const account = workerAccounts[workerInfo.parallelIndex];
      if (!account) {
        throw new Error(
          `No worker account for parallelIndex ${workerInfo.parallelIndex}: WORKER_ACCOUNTS has ` +
            `${workerAccounts.length} entries. Add accounts or lower --workers.`,
        );
      }
      await use(account);
    },
    { scope: 'worker' },
  ],

  workerStorageState: [
    async ({ browser, workerAccount }, use, workerInfo) => {
      const file = workerStorageStatePath(workerInfo.parallelIndex);
      const context = await browser.newContext({ baseURL: env.baseURL });
      try {
        await loginViaUi(await context.newPage(), workerAccount);
        ensureDirFor(file);
        await context.storageState({ path: file });
      } finally {
        await context.close();
      }
      await use(file);
    },
    { scope: 'worker' },
  ],

  workerPage: async (
    {
      browser,
      baseURL,
      workerStorageState,
      viewport,
      userAgent,
      deviceScaleFactor,
      isMobile,
      hasTouch,
    },
    use,
  ) => {
    const context = await browser.newContext({
      baseURL,
      viewport,
      userAgent,
      deviceScaleFactor,
      isMobile,
      hasTouch,
      storageState: workerStorageState,
    });
    await use(await context.newPage());
    await context.close();
  },
});
