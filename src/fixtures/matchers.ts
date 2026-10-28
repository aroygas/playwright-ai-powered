import { expect as baseExpect } from '@playwright/test';
import type { Header } from '@ui/components/Header';
import type { Table } from '@ui/components/Table';

type MatcherOptions = { timeout?: number };

/** Custom matchers over component objects. Each polls, so it retries like a web-first assertion. */
export const expect = baseExpect.extend({
  async toHaveCartCount(header: Header, expected: number, options?: MatcherOptions) {
    const name = 'toHaveCartCount';
    let actual: number | undefined;
    let pass = true;
    try {
      await baseExpect
        .poll(async () => (actual = await header.cartCount()), { timeout: options?.timeout })
        .toBe(expected);
    } catch {
      pass = false;
    }
    return {
      name,
      pass,
      expected,
      actual,
      message: () =>
        `${this.utils.matcherHint(name, undefined, undefined, { isNot: this.isNot })}\n\n` +
        `Expected cart count: ${this.isNot ? 'not ' : ''}${expected}\nReceived: ${actual}`,
    };
  },

  async toHaveRowCount(table: Table, expected: number, options?: MatcherOptions) {
    const name = 'toHaveRowCount';
    let actual: number | undefined;
    let pass = true;
    try {
      await baseExpect
        .poll(async () => (actual = await table.rows.count()), { timeout: options?.timeout })
        .toBe(expected);
    } catch {
      pass = false;
    }
    return {
      name,
      pass,
      expected,
      actual,
      message: () =>
        `${this.utils.matcherHint(name, undefined, undefined, { isNot: this.isNot })}\n\n` +
        `Expected row count: ${this.isNot ? 'not ' : ''}${expected}\nReceived: ${actual}`,
    };
  },
});
