import { NavLink, type NavLinkRenderProps } from 'react-router';
import LanguageSwitcher from './LanguageSwitcher';

function getNavLinkClass({ isActive }: NavLinkRenderProps): string {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-slate-900 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');
}

export function Navbar() {
  return (
    <header className="border-b border-gray-200">
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
