import { MAX_LEARNING_LANGS, type Lang } from './languages';
import { isValidRange, type HoursRange } from './schedule';
import { validateLanguages } from './validation';

export const HOBBIES = ['travel', 'anime', 'cooking', 'music', 'movies', 'games', 'sports', 'reading', 'photo', 'cafe', 'tech', 'art'] as const;
export type Hobby = (typeof HOBBIES)[number];

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

export type ProfileError = 'name' | 'bio' | 'learnSame' | 'learnDuplicate' | 'learnNone' | 'learnTooMany' | 'hobbies' | 'hours';

export function validateProfile(d: ProfileDraft): ProfileError | null {
  if (!d.name.trim() || d.name.trim().length > MAX_NAME) return 'name';
  if (d.bio.length > MAX_BIO) return 'bio';
  if (d.learning.length > MAX_LEARNING_LANGS) return 'learnTooMany';
  const lang = validateLanguages(d.native, d.learning.map((l) => l.lang));
  if (lang === 'sameAsNative') return 'learnSame';
  if (lang === 'duplicate') return 'learnDuplicate';
  if (lang === 'none') return 'learnNone';
  if (d.hobbies.length === 0) return 'hobbies';
  if (!isValidRange(d.hours)) return 'hours';
  return null;
}

/** A profile counts as complete once it has a bio, hobbies and available hours. */
export function isProfileComplete(p: { bio: string; hobbies: readonly string[]; hours: HoursRange | null }): boolean {
  return p.bio.trim().length > 0 && p.hobbies.length > 0 && !!p.hours && isValidRange(p.hours);
}
