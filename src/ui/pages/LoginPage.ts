import { expect } from '@playwright/test';
import { step } from '@utils/step';
import { Form } from '../components/Form';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly path = '/';
  readonly form = new Form(this.page.getByTestId('login-container'));

  async isLoaded() {
    await expect(this.page.getByRole('button', { name: 'Login' })).toBeVisible();
  }

  @step()
  async login(username: string, password: string) {
    await this.form.fill({ username, password });
    await this.form.submit('Login');
  }

  async expectError(message: string | RegExp) {
    await this.form.expectError(message);
  }
}
