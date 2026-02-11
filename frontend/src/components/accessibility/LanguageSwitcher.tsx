import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../common/LoadingSpinner';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const change = (lng: string) => {
    void i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => change('de')}
        className="px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Deutsch"
      >
        DE
      </button>
      <button
        onClick={() => change('en')}
        className="px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
