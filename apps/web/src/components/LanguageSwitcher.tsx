import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
const { i18n } = useTranslation();

const currentLanguage = i18n.language;

  return (
    <div>
        <button
        disabled={currentLanguage === "en"}
        onClick={() => i18n.changeLanguage("en")}
        >
        EN
        </button>

        <button
        disabled={currentLanguage === "fr"}
        onClick={() => i18n.changeLanguage("fr")}
        >
        FR
        </button>

        <button
        disabled={currentLanguage === "zh"}
        onClick={() => i18n.changeLanguage("zh")}
        >
        CN
        </button>    
    </div>
  );
}