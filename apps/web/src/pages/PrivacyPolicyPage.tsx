import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

const privacySections = [
  'introduction',
  'information',
  'use',
  'uploadedContent',
  'authentication',
  'security',
  'sharing',
  'retention',
  'rights',
  'children',
  'changes',
  'contact',
] as const;

export function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">{t('legal.privacy.title')}</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {t('legal.lastUpdated')}
        </p>
      </header>

      <div className="space-y-8 leading-7">
        {privacySections.map((section) => (
          <section key={section}>
            <h2 className="mb-3 text-xl font-semibold">
              {t(`legal.privacy.sections.${section}.title`)}
            </h2>

            <p className="text-muted-foreground">
              {t(`legal.privacy.sections.${section}.body`)}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-10 border-t pt-6">
        <Link to="/terms" className="text-sm underline hover:text-foreground">
          {t('footer.terms')}
        </Link>
      </div>
    </main>
  );
}
