import { useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { BookingList } from './components/BookingList';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Counter } from './components/Counter';
import { LoginForm } from './components/LoginForm';

export function App() {
  const [cart, setCart] = useState(0);
  const [confirming, setConfirming] = useState(false);
  return (
    <main>
      <AppHeader cartCount={cart} />
      <Counter onChange={setCart} />
      <LoginForm onSubmit={() => setConfirming(true)} />
      <ConfirmDialog
        open={confirming}
        title="Sign in?"
        message="Continue with these credentials."
        onConfirm={() => setConfirming(false)}
        onCancel={() => setConfirming(false)}
      />
      <BookingList />
    </main>
  );
}
