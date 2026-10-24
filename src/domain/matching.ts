import type { Lang } from './languages';
import { levelsClose, type Level } from './levels';

/**
 * buddy:    both learn the same language and have different native languages,
 *           so the learning language is the only one they share.
 * exchange: each is a native speaker of the other's learning language.
 */
export type Mode = 'buddy' | 'exchange';

export interface Learner {
  native: Lang;
  learn: Lang;
}

export interface Candidate extends Learner {
  id: string;
  level: Level;
  status: 'online' | 'offline' | 'in_call';
  languageOnly: boolean;
}

export interface MatchPrefs {
  mode: Mode;
  myLevel: Level;
  /** Only match people who show the "language only" badge. */
  languageOnlyPartners: boolean;
  /** Only match people within one level step (buddy mode). */
  matchLevel: boolean;
  blocked: ReadonlySet<string>;
}

export function relation(me: Learner, other: Learner): Mode | null {
  if (other.native === me.learn && other.learn === me.native) return 'exchange';
  if (other.learn === me.learn && other.native !== me.native) return 'buddy';
  return null;
}

/** Whether a candidate can be offered as a random-call partner. */
export function isEligible(me: Learner, c: Candidate, prefs: MatchPrefs): boolean {
  if (c.status !== 'online') return false;
  if (prefs.blocked.has(c.id)) return false;
  if (relation(me, c) !== prefs.mode) return false;
  if (prefs.languageOnlyPartners && !c.languageOnly) return false;
  if (prefs.matchLevel && prefs.mode === 'buddy' && !levelsClose(prefs.myLevel, c.level)) return false;
  return true;
}

export function pickRandomPartner(
  me: Learner,
  candidates: readonly Candidate[],
  prefs: MatchPrefs,
  rng: () => number = Math.random,
): Candidate | null {
  const pool = candidates.filter((c) => isEligible(me, c, prefs));
  if (pool.length === 0) return null;
  return pool[Math.floor(rng() * pool.length)];
}
