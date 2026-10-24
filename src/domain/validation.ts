import type { Lang } from './languages';

export const MIN_AGE = 18;

export function isEmail(value: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());
}

export function isLoginCode(value: string): boolean {
  return /^\d{6}$/.test(value);
}

/** Returns a real date, or null when the parts do not form one (e.g. Feb 30). */
export function toDate(year: number, month: number, day: number): Date | null {
  if (![year, month, day].every(Number.isInteger)) return null;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day ? d : null;
}

export function ageOn(birth: Date, now: Date): number {
  let age = now.getFullYear() - birth.getFullYear();
  const hadBirthday =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;
  return age;
}

export function isAdult(birth: Date, now: Date = new Date()): boolean {
  return ageOn(birth, now) >= MIN_AGE;
}

export type LanguageError = 'sameAsNative' | 'duplicate' | 'none' | null;

export function validateLanguages(native: Lang, learning: readonly Lang[]): LanguageError {
  if (learning.length === 0) return 'none';
  if (learning.includes(native)) return 'sameAsNative';
  if (new Set(learning).size !== learning.length) return 'duplicate';
  return null;
}
