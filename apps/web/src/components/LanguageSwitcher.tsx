import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "zh", label: "中文" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div>
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => i18n.changeLanguage(language.code)}
        >
          {language.label}
        </button>
      ))}
    </div>
  );
}