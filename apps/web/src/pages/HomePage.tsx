import { useTranslation } from 'react-i18next';
import { RotatingCube } from '@/components/common/RotatingCube';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">{t('home.title')}</h1>

      <p className="mt-2 text-muted-foreground">{t('home.welcome')}</p>
      <RotatingCube/>
    </main>
  );
}
