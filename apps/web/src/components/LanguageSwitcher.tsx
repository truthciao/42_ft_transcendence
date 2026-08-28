import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

type Language = {
  code: 'en' | 'fr' | 'zh';
  label: string;
};

const languages: Language[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'zh', label: '中文' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      {languages.map((language) => {
        const isActive = i18n.language.startsWith(language.code);

        return (
          <Button
            key={language.code}
            variant={isActive ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => {
              void i18n.changeLanguage(language.code);
            }}
            disabled={isActive}
          >
            {language.label}
          </Button>
        );
      })}
    </div>
  );
}
