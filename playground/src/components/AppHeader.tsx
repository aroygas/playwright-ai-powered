import { Link } from 'react-router-dom';
import { useTheme } from '../providers';

type Props = { cartCount?: number };

/** Mirrors the saucedemo header markup contract so the same `Header` component object drives both. */
export function AppHeader({ cartCount = 0 }: Props) {
  const { theme, toggle } = useTheme();
  return (
    <header className="app-header" data-test="primary-header">
      <button>Open Menu</button>
      <button onClick={toggle} aria-pressed={theme === 'dark'}>
        Dark mode
      </button>
      <Link to="/cart" data-test="shopping-cart-link">
        Cart
        {cartCount > 0 && <span data-test="shopping-cart-badge">{cartCount}</span>}
      </Link>
    </header>
  );
}
