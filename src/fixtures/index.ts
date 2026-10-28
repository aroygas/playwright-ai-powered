import { mergeTests } from '@playwright/test';
import { test as authTest } from './auth.fixtures';
import { test as apiTest } from './api.fixtures';

// Single entry point for specs. ui.fixtures (Phase 4) will be merged here too.
export const test = mergeTests(authTest, apiTest);
export { expect } from './base';
