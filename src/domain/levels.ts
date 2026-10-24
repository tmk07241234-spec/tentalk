/**
 * Five self-assessed levels shown as bars. Names and descriptions live in the
 * i18n files (levels.<n>.name / levels.<n>.desc). Each maps to a CEFR band so the
 * data can be analysed or calibrated later.
 */
export type Level = 1 | 2 | 3 | 4 | 5;

export const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];

export const CEFR: Record<Level, string> = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1' };

export function isLevel(n: number): n is Level {
  return Number.isInteger(n) && n >= 1 && n <= 5;
}

/** Levels within one step of each other count as a close match. */
export function levelsClose(a: Level, b: Level): boolean {
  return Math.abs(a - b) <= 1;
}
