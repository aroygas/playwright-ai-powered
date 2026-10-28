import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

/** Generic form: fields are found by accessible label, falling back to test id. */
export class Form extends BaseComponent {
  field(name: string): Locator {
    return this.byLabel(name).or(this.byTestId(name));
  }

  async fill(values: Record<string, string>) {
    for (const [name, value] of Object.entries(values)) {
      await this.field(name).fill(value);
    }
  }

  async submit(buttonName: string | RegExp = /submit/i) {
    await this.byRole('button', { name: buttonName }).click();
  }

  async expectError(message: string | RegExp) {
    await expect(this.byRole('alert').or(this.byTestId('error'))).toContainText(message);
  }
}
