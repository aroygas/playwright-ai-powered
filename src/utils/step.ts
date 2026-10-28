import { test } from '@playwright/test';

/**
 * Method decorator: wraps the call in a boxed `test.step` so reports read as user actions
 * ("LoginPage.login") instead of raw locator calls. Only for code that runs inside a test.
 */
export function step(name?: string) {
  return function <This extends object, Args extends unknown[], Return>(
    target: (this: This, ...args: Args) => Promise<Return>,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>,
  ) {
    return function (this: This, ...args: Args): Promise<Return> {
      const label = name ?? `${this.constructor.name}.${String(context.name)}`;
      return test.step(label, () => target.call(this, ...args), { box: true });
    };
  };
}
