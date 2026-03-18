import de from './de/common.json';
import en from './en/common.json';
import fr from './fr/common.json';
import es from './es/common.json';

// Each language registered here is automatically picked up by i18n.ts
// and LanguageSwitcher. To add a language, run:
//   npm run add-language -- <code> "<Native Name>"
// e.g.: npm run add-language -- fr "Français"

export interface LanguageConfig {
  code: string;
  nativeName: string;
  translations: Record<string, unknown>;
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'de', nativeName: 'Deutsch', translations: de as Record<string, unknown> },
  { code: 'en', nativeName: 'English', translations: en as Record<string, unknown> },
  { code: 'fr', nativeName: 'Français', translations: fr as Record<string, unknown> },
  { code: 'es', nativeName: 'Español', translations: es as Record<string, unknown> },
];
