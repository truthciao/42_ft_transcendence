import { useTranslation } from 'react-i18next';

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
    <div>
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => {
            void i18n.changeLanguage(language.code);
          }}
          disabled={i18n.language.startsWith(language.code)}
          className="rounded-md px-1 py-1.5 text-sm hover:bg-muted disabled:font-semibold disabled:text-foreground"
        >
          {language.label}
        </button>
      ))}
    </div>
  );
}
