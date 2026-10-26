import { MAX_LEARNING_LANGS, type Lang } from './languages';
import { isValidRange, type HoursRange } from './schedule';
import { validateLanguages } from './validation';

export const HOBBIES = ['travel', 'anime', 'cooking', 'music', 'movies', 'games', 'sports', 'reading', 'photo', 'cafe', 'tech', 'art'] as const;
export type Hobby = (typeof HOBBIES)[number];

/** Voice intro length limits, in seconds. */
export const VOICE_MAX_SECONDS = 15;
export const VOICE_MIN_SECONDS = 3;

export const MAX_NAME = 20;
export const MAX_BIO = 200;

export interface ProfileDraft {
  name: string;
  bio: string;
  native: Lang;
  learning: { lang: Lang }[];
  hobbies: string[];
  hours: HoursRange;
}

// Hobbies are optional here: a new user may want to save just a voice intro. Home nudges until they are added.
export type ProfileError = 'name' | 'bio' | 'learnSame' | 'learnDuplicate' | 'learnNone' | 'learnTooMany' | 'hours';

export function validateProfile(d: ProfileDraft): ProfileError | null {
  if (!d.name.trim() || d.name.trim().length > MAX_NAME) return 'name';
  if (d.bio.length > MAX_BIO) return 'bio';
  if (d.learning.length > MAX_LEARNING_LANGS) return 'learnTooMany';
  const lang = validateLanguages(d.native, d.learning.map((l) => l.lang));
  if (lang === 'sameAsNative') return 'learnSame';
  if (lang === 'duplicate') return 'learnDuplicate';
  if (lang === 'none') return 'learnNone';
  if (!isValidRange(d.hours)) return 'hours';
  return null;
}

/** A profile counts as complete once it has a bio, hobbies and available hours. */
export function isProfileComplete(p: { bio: string; hobbies: readonly string[]; hours: HoursRange | null }): boolean {
  return p.bio.trim().length > 0 && p.hobbies.length > 0 && !!p.hours && isValidRange(p.hours);
}

/** Uploaded photos and voice intros are https URLs; anything else is still only on this device. */
export const isUploaded = (uri: string) => uri.startsWith('https://');
