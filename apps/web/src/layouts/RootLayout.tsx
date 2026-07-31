import {
  NavLink,
  Outlet,
  type NavLinkRenderProps,
} from 'react-router';

function getNavLinkClass({
  isActive,
}: NavLinkRenderProps): string {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-slate-900 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');
}

export function RootLayout() {
  return (
    <div>
      <header className="border-b border-gray-200">
        <nav style={{ display: 'flex', padding: '1rem', alignItems: 'center' }}>
          <NavLink
            to="/"
            end
            className={getNavLinkClass}
            style={{ marginRight: '0.5rem' }}
          >
            Home
          </NavLink>

          <NavLink
            to="/login"
            className={getNavLinkClass}
            style={{ marginRight: '0.5rem' }}
          >
            Login
          </NavLink>

          <NavLink
            to="/register"
            className={getNavLinkClass}
            style={{ marginRight: '0.5rem' }}
          >
            Register
          </NavLink>

          <NavLink
            to="/profile"
            className={getNavLinkClass}
          >
            Profile
          </NavLink>
        </nav>
      </header>

      <Outlet />
    </div>
  );
}