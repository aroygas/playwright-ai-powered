import { test, expect } from '@playwright/experimental-ct-react';
import { AppHeader } from '@playground/components/AppHeader';
import { ConfirmDialog } from '@playground/components/ConfirmDialog';
import { LoginForm } from '@playground/components/LoginForm';
import type { HooksConfig } from '@playground/providers';
import { Form } from '@ui/components/Form';
import { Header } from '@ui/components/Header';
import { Modal } from '@ui/components/Modal';
import { TAGS } from '@utils/tags';

// The component objects below are the very ones E2E uses (src/ui/components): here the root is a
// mounted component, there it is a page region.

test.describe('Header', () => {
  test('shows the cart badge only when the cart has items', async ({ mount }) => {
    const component = await mount(<AppHeader cartCount={2} />);
    const header = new Header(component);

    await header.expectVisible();
    await header.expectCartCount(2);
  });

  test('has no badge for an empty cart', async ({ mount }) => {
    const header = new Header(await mount(<AppHeader />));

    await header.expectCartCount(0);
  });

  test('theme provider is configurable through hooksConfig', async ({ mount }) => {
    const component = await mount<HooksConfig>(<AppHeader />, { hooksConfig: { theme: 'dark' } });

    await expect(component.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('router provider drives the cart link', async ({ mount }) => {
    const component = await mount<HooksConfig>(<AppHeader />, { hooksConfig: { route: '/cart' } });

    await expect(new Header(component).cartLink).toHaveAttribute('href', '/cart');
  });
});

test.describe('Form', () => {
  test(
    'fills fields by label and submits credentials',
    { tag: [TAGS.smoke] },
    async ({ mount }) => {
      const submitted: { username: string; password: string }[] = [];
      const form = new Form(await mount(<LoginForm onSubmit={(c) => submitted.push(c)} />));

      await form.fill({ Username: 'alice', Password: 's3cret' });
      await form.submit('Login');

      await expect.poll(() => submitted).toEqual([{ username: 'alice', password: 's3cret' }]);
    },
  );

  test('shows a validation error for empty fields', async ({ mount }) => {
    const form = new Form(await mount(<LoginForm onSubmit={() => {}} />));

    await form.submit('Login');

    await form.expectError(/required/i);
  });
});

test.describe('Modal', () => {
  test('confirm and cancel callbacks fire', async ({ mount }) => {
    const calls: string[] = [];
    const component = await mount(
      <ConfirmDialog
        open
        title="Delete booking?"
        message="This cannot be undone."
        onConfirm={() => calls.push('confirm')}
        onCancel={() => calls.push('cancel')}
      />,
    );
    const modal = new Modal(component.getByRole('dialog'));

    await modal.expectOpen();
    await modal.expectTitle('Delete booking?');
    await modal.clickButton('Confirm');
    await modal.close();

    await expect.poll(() => calls).toEqual(['confirm', 'cancel']);
  });

  test('renders nothing while closed', async ({ mount }) => {
    const component = await mount(
      <ConfirmDialog
        open={false}
        title="Hidden"
        message=""
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    await new Modal(component.getByRole('dialog')).expectClosed();
  });
});
