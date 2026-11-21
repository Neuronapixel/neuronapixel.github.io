import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAppI18n, readSavedLocale, saveLocale } from './index';
import en from './locales/en.json';
import es from './locales/es.json';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('AR localization', () => {
  it('provides every English dictionary entry in Spanish', () => {
    for (const section of Object.keys(en) as (keyof typeof en)[]) {
      expect(Object.keys(es[section]).sort()).toEqual(
        Object.keys(en[section]).sort(),
      );
      expect(
        Object.values(es[section]).every((message) => message.trim()),
      ).toBe(true);
    }
  });
  it('defaults to English and restores a saved supported language', () => {
    expect(readSavedLocale()).toBe('en');
    saveLocale('es');
    expect(readSavedLocale()).toBe('es');
    expect(createAppI18n(readSavedLocale()).global.t('ar.title')).toBe(
      es.ar.title,
    );
    saveLocale('fr');
    expect(readSavedLocale()).toBe('en');
  });
  it('keeps translations available when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });
    expect(readSavedLocale()).toBe('en');
    expect(() => saveLocale('es')).not.toThrow();
    expect(createAppI18n('es').global.t('quickLook.action')).toBe(
      es.quickLook.action,
    );
  });
});
