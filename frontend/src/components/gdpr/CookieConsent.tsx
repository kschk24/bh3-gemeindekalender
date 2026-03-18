import { useEffect } from 'react';
import { useConsent } from '../../context/ConsentContext';

export default function CookieConsent() {
  const { consent, accept, reject } = useConsent();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && consent === null) {
        reject();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [consent, reject]);

  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4 md:p-6"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h2 id="cookie-consent-title" className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Cookie-Einstellungen
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Diese Website verwendet technisch notwendige Cookies für die Authentifizierung (HttpOnly, kein Tracking).
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={reject}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Ablehnen
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
