import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import { uiLangFromDevice, type UiLang } from '@/domain/languages';
import ja from './locales/ja';
import en from './locales/en';
import ko from './locales/ko';
import es from './locales/es';

export const resources = {
  ja: { translation: ja },
  en: { translation: en },
  ko: { translation: ko },
  es: { translation: es },
} as const;

export function deviceUiLang(): UiLang {
  return uiLangFromDevice(getLocales()[0]?.languageCode);
}

const i18n = createInstance();
i18n.use(initReactI18next).init({
  resources,
  lng: deviceUiLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
