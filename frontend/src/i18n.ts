import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import deCommon from './locales/de/common.json';
import enCommon from './locales/en/common.json';

i18n.use(initReactI18next).init({
  resources: {
    de: { common: deCommon },
    en: { common: enCommon },
  },
  lng: 'de',
  fallbackLng: 'de',
  ns: ['common'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: true },
});

export default i18n;
