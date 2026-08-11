import { useTranslation } from 'react-i18next';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">{t('home.title')}</h1>

      <p className="mt-2 text-gray-600">{t('home.welcome')}</p>

    </main>
  );
}
