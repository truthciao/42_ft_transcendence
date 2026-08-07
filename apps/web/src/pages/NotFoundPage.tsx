import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <main>
      <h1>{t('notfound.title')}</h1>
      <p>{t('notfound.message')}</p>

      <Link to="/">{t('notfound.back')}</Link>
    </main>
  );
}
