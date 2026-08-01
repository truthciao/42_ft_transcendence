import { useTranslation } from "react-i18next";

type Language = {
  code: "en" | "fr" | "zh";
  label: string;
};

const languages: Language[] = [
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
          onClick={() => {
            void i18n.changeLanguage(language.code);
          }}
          disabled={i18n.language === language.code}
        >
          {language.label}
        </button>
      ))}
    </div>
  );
}