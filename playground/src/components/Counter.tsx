import { useState } from 'react';

type Props = {
  label?: string;
  initial?: number;
  onChange?: (value: number) => void;
};

export function Counter({ label = 'Counter', initial = 0, onChange }: Props) {
  const [value, setValue] = useState(initial);
  const update = (next: number) => {
    setValue(next);
    onChange?.(next);
  };
  return (
    <section aria-label={label}>
      <h2>{label}</h2>
      <p data-test="counter-value" aria-live="polite">
        {value}
      </p>
      <button onClick={() => update(value - 1)}>Decrement</button>
      <button onClick={() => update(value + 1)}>Increment</button>
    </section>
  );
}
