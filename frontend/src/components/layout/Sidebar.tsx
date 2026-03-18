import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../locales/index';


const GT_LANGUAGES = [
  { code: 'ar', name: 'العربية' },
  { code: 'zh-CN', name: '中文 (简体)' },
  { code: 'zh-TW', name: '中文 (繁體)' },
  { code: 'cs', name: 'Čeština' },
  { code: 'da', name: 'Dansk' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fi', name: 'Suomi' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'iw', name: 'עברית' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'hu', name: 'Magyar' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'no', name: 'Norsk' },
  { code: 'pl', name: 'Polski' },
  { code: 'pt', name: 'Português' },
  { code: 'ro', name: 'Română' },
  { code: 'ru', name: 'Русский' },
  { code: 'sk', name: 'Slovenčina' },
  { code: 'sv', name: 'Svenska' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'uk', name: 'Українська' },
  { code: 'vi', name: 'Tiếng Việt' },
];

// Icon components
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TextSizeIcon = () => (
  <span className="font-bold text-sm">aA</span>
);

interface SidebarButtonProps {
  onClick?: () => void;
  href?: string;
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'primary' | 'social';
}

function SidebarButton({ onClick, href, icon, label, variant = 'default' }: SidebarButtonProps) {
  const baseClasses = "w-10 h-10 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    default: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 focus:ring-primary-500",
    primary: "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500",
    social: "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500",
  };

  const className = `${baseClasses} ${variantClasses[variant]}`;

  if (href) {
    return (
      <a
        href={href}
        className={className}
        aria-label={label}
        target="_blank"
        rel="noopener noreferrer"
      >
        {icon}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={className}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

export default function Sidebar() {
  const { effectiveTheme, setTheme } = useTheme();
  const { fontScale, setFontScale } = useAccessibility();
  const { i18n } = useTranslation();
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showGTList, setShowGTList] = useState(false);

  const scales = ['100', '110', '125', '150'] as const;

  const increaseFontSize = () => {
    const currentIndex = scales.indexOf(fontScale);
    if (currentIndex < scales.length - 1) {
      setFontScale(scales[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = scales.indexOf(fontScale);
    if (currentIndex > 0) {
      setFontScale(scales[currentIndex - 1]);
    }
  };

  const resetFontSize = () => {
    setFontScale('100');
  };

  const toggleTheme = () => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <aside
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col space-y-2"
      aria-label="Schnellzugriff"
    >
      {/* Contact */}
      <SidebarButton
        href="mailto:info@gemeinde.de"
        icon={<MailIcon />}
        label="E-Mail Kontakt"
        variant="default"
      />

      {/* Language */}
      <div className="relative">
        <SidebarButton
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          icon={<span className="text-sm font-semibold" translate="no">{i18n.language.toUpperCase()}</span>}
          label={`Sprache: ${LANGUAGES.find((l) => l.code === i18n.language)?.nativeName ?? i18n.language}`}
          variant="default"
        />
        {showLanguageMenu && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowLanguageMenu(false)}
              aria-hidden="true"
            />
            <div className="absolute right-12 top-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 min-w-[120px] z-40">
              {LANGUAGES.map(({ code, nativeName }) => (
                <button
                  key={code}
                  onClick={() => {
                    void i18n.changeLanguage(code);
                    setShowLanguageMenu(false);
                    // If GT is active, clear its cookie and reload to restore original DOM
                    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
                    if (select?.value) {
                      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 UTC';
                      document.cookie = `googtrans=; path=/; domain=${location.hostname}; expires=Thu, 01 Jan 1970 00:00:01 UTC`;
                      window.location.reload();
                    }
                  }}
                  className={`block w-full text-left px-3 py-2 rounded text-gray-900 dark:text-white ${
                    i18n.language === code
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span translate="no">{nativeName}</span>
                </button>
              ))}

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

              {/* Google Translate: weitere Sprachen */}
              <button
                onClick={() => setShowGTList((v) => !v)}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              >
                <span>🌐</span>
                <span>Weitere Sprachen {showGTList ? '▲' : '▼'}</span>
              </button>

              {showGTList && (
                <div className="max-h-48 overflow-y-auto mt-1 space-y-0.5">
                  {GT_LANGUAGES.map(({ code, name }) => (
                    <button
                      key={code}
                      translate="no"
                      onClick={() => {
                        const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
                        if (select) {
                          select.value = code;
                          select.dispatchEvent(new Event('change'));
                        }
                        setShowLanguageMenu(false);
                        setShowGTList(false);
                      }}
                      className="block w-full text-left px-3 py-1.5 rounded text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Font Size */}
      <div className="relative">
        <SidebarButton
          onClick={() => setShowFontMenu(!showFontMenu)}
          icon={<TextSizeIcon />}
          label={`Schriftgröße: ${fontScale}%`}
          variant="primary"
        />
        {showFontMenu && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowFontMenu(false)}
              aria-hidden="true"
            />
            <div className="absolute right-12 top-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 min-w-[140px] z-40">
              <button
                onClick={increaseFontSize}
                disabled={fontScale === '150'}
                className="flex items-center justify-between w-full px-3 py-2 rounded text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
              >
                <span>Größer</span>
                <span className="text-lg font-bold">A+</span>
              </button>
              <button
                onClick={resetFontSize}
                className={`flex items-center justify-between w-full px-3 py-2 rounded text-gray-900 dark:text-white ${
                  fontScale === '100' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>Standard</span>
                <span className="text-base font-bold">A</span>
              </button>
              <button
                onClick={decreaseFontSize}
                disabled={fontScale === '100'}
                className="flex items-center justify-between w-full px-3 py-2 rounded text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
              >
                <span>Kleiner</span>
                <span className="text-sm font-bold">A-</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Theme Toggle */}
      <SidebarButton
        onClick={toggleTheme}
        icon={effectiveTheme === 'dark' ? <MoonIcon /> : <SunIcon />}
        label={`Theme: ${effectiveTheme === 'dark' ? 'Dunkel' : 'Hell'}`}
        variant="default"
      />

      {/* Divider */}
      <div className="h-2" />

      {/* Social Media */}
      <SidebarButton
        href="https://facebook.com"
        icon={<FacebookIcon />}
        label="Facebook"
        variant="social"
      />

      <SidebarButton
        href="https://instagram.com"
        icon={<InstagramIcon />}
        label="Instagram"
        variant="social"
      />

      <SidebarButton
        href="https://linkedin.com"
        icon={<LinkedInIcon />}
        label="LinkedIn"
        variant="social"
      />
    </aside>
  );
}
