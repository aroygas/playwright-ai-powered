import type { Page } from '@playwright/test';

/** Base for Page Objects: a route plus components composed from regions of the page. */
export abstract class BasePage {
  abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async goto() {
    await this.page.goto(this.path);
    await this.isLoaded();
  }

  /** Resolves once the page is ready (web-first assertion on a landmark); throws on timeout. */
  abstract isLoaded(): Promise<void>;
}
