import { mergeTests } from '@playwright/test';
import { test as authTest } from './auth.fixtures';
import { test as apiTest } from './api.fixtures';
import { test as uiTest } from './ui.fixtures';

// Single entry point for specs: `import { test, expect } from '@fixtures'`.
export const test = mergeTests(authTest, apiTest, uiTest);
export { expect } from './matchers';
