import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <p className="text-sm text-muted-foreground">
          {t('footer.copyright')}
        </p>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            to="/terms"
            className="text-muted-foreground hover:text-foreground"
          >
            {t('footer.terms')}
          </Link>

          <Link
            to="/privacy"
            className="text-muted-foreground hover:text-foreground"
          >
            {t('footer.privacy')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}