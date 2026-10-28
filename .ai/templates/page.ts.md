Target: `src/ui/pages/<Name>Page.ts`, plus a lazy fixture in `src/fixtures/ui.fixtures.ts`:
`<name>Page: async ({ page }, use) => { await use(new <Name>Page(page)); }`

```ts
import { expect } from '@playwright/test';
import { step } from '@utils/step';
import { Header } from '../components/Header';
import { BasePage } from './BasePage';

export class <Name>Page extends BasePage {
  readonly path = '/<route>';
  readonly header = new Header(this.page.getByTestId('primary-header'));

  async isLoaded() {
    await expect(this.page).toHaveURL(/<route>/);
  }

  @step()
  async <action>() {
    await this.page.getByRole('button', { name: '<Label>' }).click();
  }
}
```
