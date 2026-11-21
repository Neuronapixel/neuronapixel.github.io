import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import es from './locales/es.json';

export type Locale = 'en' | 'es';
export type ArMessageKey = keyof typeof en.arStatus;
const localeStorageKey = 'neuronapixel.locale';

export const readSavedLocale = (): Locale => {
  try {
    return localStorage.getItem(localeStorageKey) === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
};

export const saveLocale = (locale: string) => {
  try {
    localStorage.setItem(localeStorageKey, locale);
  } catch {
    // Language switching still works when browser storage is unavailable.
  }
};

export const createAppI18n = (locale: Locale = 'en') =>
  createI18n<[typeof en], Locale, false>({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages: { en, es },
  });
