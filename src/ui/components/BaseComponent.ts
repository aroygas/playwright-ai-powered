import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';

type RoleOptions = Parameters<Locator['getByRole']>[1];

/**
 * Base for every Component Object. All lookups are scoped to `root`; locator policy is
 * getByRole > getByLabel > getByTestId. No CSS/XPath, no `page` access, no implicit assertions.
 * The same component works against an E2E page region and a Component Testing `mount()` result.
 */
export abstract class BaseComponent {
  constructor(protected readonly root: Locator) {}

  /** Root locator, for web-first assertions in specs: `await expect(component.locator).toBeVisible()`. */
  get locator(): Locator {
    return this.root;
  }

  protected byRole(role: Parameters<Locator['getByRole']>[0], options?: RoleOptions): Locator {
    return this.root.getByRole(role, options);
  }

  protected byLabel(text: string | RegExp): Locator {
    return this.root.getByLabel(text);
  }

  protected byTestId(id: string | RegExp): Locator {
    return this.root.getByTestId(id);
  }

  async expectVisible() {
    await expect(this.root).toBeVisible();
  }

  async expectHidden() {
    await expect(this.root).toBeHidden();
  }
}
