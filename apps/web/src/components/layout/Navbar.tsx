import { NavLink, type NavLinkRenderProps } from 'react-router';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';

function getNavLinkClass({ isActive }: NavLinkRenderProps): string {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-foreground text-background'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  ].join(' ');
}

export function Navbar() {
  const { t } = useTranslation();

  return (
    <header className="border-b border-border">
      <nav className="flex items-center p-4">
        <NavLink to="/" end className={getNavLinkClass}>
          {t('home.title')}
        </NavLink>

        <NavLink to="/login" className={getNavLinkClass}>
          {t('common.login')}
        </NavLink>

        <NavLink to="/register" className={getNavLinkClass}>
          {t('auth.register')}
        </NavLink>

        <NavLink to="/showcase" className={getNavLinkClass}>
          {t('showcase.title')}
        </NavLink>

        <NavLink to="/eval" className={getNavLinkClass}>
          {t('evaluation.title')}
        </NavLink>

        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
}
