Target: `src/ui/components/<Name>.ts`

```ts
import { expect } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

/** <One-line description of the component>. */
export class <Name> extends BaseComponent {
  // Locators: byRole > byLabel > byTestId. All scoped to the root.
  private readonly submitButton = this.byRole('button', { name: '<Label>' });

  async submit() {
    await this.submitButton.click();
  }

  // Assertion helpers must be named expectX().
  async expectSubmitEnabled() {
    await expect(this.submitButton).toBeEnabled();
  }
}
```
