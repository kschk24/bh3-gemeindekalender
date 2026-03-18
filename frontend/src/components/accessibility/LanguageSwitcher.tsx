import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../locales/index';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center space-x-1">
      {LANGUAGES.map(({ code, nativeName }) => {
        const isActive = i18n.language === code;
        return (
          <button
            key={code}
            onClick={() => void i18n.changeLanguage(code)}
            className={`px-2 py-1 text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              isActive
                ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-semibold'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
            aria-label={nativeName}
            aria-pressed={isActive}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
