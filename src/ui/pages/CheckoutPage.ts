import { expect } from '@playwright/test';
import { step } from '@utils/step';
import { Form } from '../components/Form';
import { BasePage } from './BasePage';

export type CustomerInfo = { firstName: string; lastName: string; postalCode: string };

export class CheckoutPage extends BasePage {
  readonly path = '/checkout-step-one.html';
  readonly form = new Form(this.page.getByTestId('checkout-info-container'));

  async isLoaded() {
    await expect(this.page.getByRole('button', { name: 'Continue' })).toBeVisible();
  }

  @step()
  async submitCustomerInfo(info: CustomerInfo) {
    await this.form.fill({ ...info });
    await this.form.submit('Continue');
  }

  async expectOverview() {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
  }
}
