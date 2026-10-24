/** Languages a person can have as native or learning language. */
export type Lang = 'ja' | 'en' | 'ko' | 'es' | 'pt' | 'vi' | 'de';

/** Languages the app UI is translated into. */
export const UI_LANGS = ['ja', 'en', 'ko', 'es'] as const;
export type UiLang = (typeof UI_LANGS)[number];

/** Languages offered as native / learning choices at launch. */
export const SELECTABLE_LANGS: Lang[] = ['ja', 'en', 'ko', 'es'];

/** Up to this many learning languages per person (free). */
export const MAX_LEARNING_LANGS = 2;

export function isUiLang(code: string | null | undefined): code is UiLang {
  return !!code && (UI_LANGS as readonly string[]).includes(code);
}

/** Picks the UI language from a device language code; unsupported languages fall back to English. */
export function uiLangFromDevice(languageCode: string | null | undefined): UiLang {
  const code = languageCode?.slice(0, 2).toLowerCase();
  return isUiLang(code) ? code : 'en';
}
