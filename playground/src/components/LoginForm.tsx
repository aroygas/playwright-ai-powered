import { useState } from 'react';
import type { FormEvent } from 'react';

type Props = { onSubmit: (credentials: { username: string; password: string }) => void };

/** Mirrors saucedemo's login markup (`login-container`, `error`) so `Form` is shared with E2E. */
export function LoginForm({ onSubmit }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    setError('');
    onSubmit({ username, password });
  };

  return (
    <div data-test="login-container">
      <form onSubmit={submit}>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && (
          <p role="alert" data-test="error">
            {error}
          </p>
        )}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
