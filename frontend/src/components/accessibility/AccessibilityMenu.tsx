import { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { fontScale, highContrast, setFontScale, setHighContrast } = useAccessibility();

  const fontScales = [
    { value: '100', label: '100%' },
    { value: '110', label: '110%' },
    { value: '125', label: '125%' },
    { value: '150', label: '150%' },
  ] as const;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Barrierefreiheit-Einstellungen öffnen"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 p-4"
            role="menu"
            aria-label="Barrierefreiheit-Einstellungen"
          >
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">
              Barrierefreiheit
            </h3>

            {/* Font Size */}
            <div className="mb-4">
              <label
                htmlFor="font-scale"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Schriftgröße
              </label>
              <select
                id="font-scale"
                value={fontScale}
                onChange={(e) =>
                  setFontScale(e.target.value as typeof fontScale)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {fontScales.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="high-contrast"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Hoher Kontrast
              </label>
              <button
                id="high-contrast"
                role="switch"
                aria-checked={highContrast}
                onClick={() => setHighContrast(!highContrast)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  highContrast
                    ? 'bg-primary-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
