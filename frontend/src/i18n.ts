import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGES } from './locales/index';

const resources = Object.fromEntries(
  LANGUAGES.map(({ code, translations }) => [code, { common: translations }]),
);

i18n.use(initReactI18next).init({
  resources,
  lng: 'de',
  fallbackLng: 'de',
  ns: ['common'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: true },
});

export default i18n;
