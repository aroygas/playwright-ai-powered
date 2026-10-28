import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

/** Dialog (`role="dialog"`). Build with `Modal.on(page)` in E2E or wrap a mounted root in CT. */
export class Modal extends BaseComponent {
  static on(page: Page, name?: string | RegExp): Modal {
    return new Modal(page.getByRole('dialog', { name }));
  }

  readonly title = this.byRole('heading');

  async clickButton(name: string | RegExp) {
    await this.byRole('button', { name }).click();
  }

  async close() {
    await this.clickButton(/close|cancel/i);
  }

  async expectOpen() {
    await expect(this.root).toBeVisible();
  }

  async expectClosed() {
    await expect(this.root).toBeHidden();
  }

  async expectTitle(title: string | RegExp) {
    await expect(this.title).toHaveText(title);
  }
}
