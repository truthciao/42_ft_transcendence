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
        <nav className="flex gap-2 p-4">
          <NavLink
            to="/"
            end
            className={getNavLinkClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/login"
            className={getNavLinkClass}
          >
            Login
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