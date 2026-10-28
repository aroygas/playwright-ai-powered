import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

/** Semantic table (`<table>` / role=table) addressed by column header and row text. */
export class Table extends BaseComponent {
  readonly headers = this.byRole('columnheader');
  /** Body rows only. Requires `<thead>` + `<tbody>`: the last rowgroup is the body. */
  readonly rows = this.byRole('rowgroup').last().getByRole('row');

  row(text: string | RegExp): Locator {
    return this.rows.filter({ hasText: text });
  }

  async columnIndex(header: string): Promise<number> {
    const names = (await this.headers.allTextContents()).map((h) => h.trim());
    const index = names.indexOf(header);
    if (index < 0) throw new Error(`Column "${header}" not found. Columns: ${names.join(', ')}`);
    return index;
  }

  async cell(rowText: string | RegExp, header: string): Promise<Locator> {
    return this.row(rowText)
      .getByRole('cell')
      .nth(await this.columnIndex(header));
  }

  async expectRowCount(count: number) {
    await expect(this.rows).toHaveCount(count);
  }

  async expectCell(rowText: string | RegExp, header: string, value: string | RegExp) {
    await expect(await this.cell(rowText, header)).toHaveText(value);
  }
}
