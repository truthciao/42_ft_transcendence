import { NavLink, type NavLinkRenderProps } from 'react-router';
import LanguageSwitcher from './LanguageSwitcher';

function getNavLinkClass({ isActive }: NavLinkRenderProps): string {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-foreground text-background'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  ].join(' ');
}

export function Navbar() {
  return (
    <header className="border-b border-border">
      <nav style={{ display: 'flex', padding: '1rem', alignItems: 'center' }}>
        <NavLink to="/" end className={getNavLinkClass}>
          Home
        </NavLink>

        <NavLink to="/login" className={getNavLinkClass}>
          Login
        </NavLink>

        <NavLink to="/register" className={getNavLinkClass}>
          Register
        </NavLink>

        <NavLink to="/showcase" className={getNavLinkClass}>
          Showcase
        </NavLink>

        <div style={{ marginLeft: 'auto' }}>
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
}
