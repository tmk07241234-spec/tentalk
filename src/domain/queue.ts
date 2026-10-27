import type { Lang } from './languages';
import { levelsClose, type Level } from './levels';
import { relation, type Mode } from './matching';

/**
 * The random-call waiting line, kept on the server. Each waiting person has one entry
 * and refreshes it while the search screen is open; the next compatible person to
 * arrive takes the longest-waiting entry and both are put in the same call.
 */
export interface QueueEntry {
  uid: string;
  mode: Mode;
  native: Lang;
  learn: Lang;
  level: Level;
  /** Shows the "language only" badge. */
  languageOnly: boolean;
  /** Wants only partners with the badge. */
  wantLanguageOnly: boolean;
  /** Wants partners within one level step (buddy mode). */
  matchLevel: boolean;
  blocked: string[];
  /** Last refresh, ms since epoch. */
  updatedAt: number;
  /** Set when someone matched this entry; the owner picks the call up on their next refresh. */
  callId?: string | null;
}

/** An entry not refreshed for this long belongs to someone who left the search screen. */
export const QUEUE_STALE_MS = 15_000;

/** Entries are stored under the key of the people they can match, so one equality query finds them. */
export function queueKey(e: Pick<QueueEntry, 'mode' | 'native' | 'learn'>): string {
  return e.mode === 'buddy' ? `buddy:${e.learn}` : `exchange:${e.native}>${e.learn}`;
}

/** The key of entries that can match `e`. */
export function seekKey(e: Pick<QueueEntry, 'mode' | 'native' | 'learn'>): string {
  return e.mode === 'buddy' ? `buddy:${e.learn}` : `exchange:${e.learn}>${e.native}`;
}

function accepts(a: QueueEntry, b: QueueEntry): boolean {
  if (a.blocked.includes(b.uid)) return false;
  if (a.wantLanguageOnly && !b.languageOnly) return false;
  if (a.matchLevel && a.mode === 'buddy' && !levelsClose(a.level, b.level)) return false;
  return true;
}

/** The longest-waiting entry that `me` and its owner would both accept, or null. */
export function pickQueuePartner(me: QueueEntry, entries: readonly QueueEntry[], now: number): QueueEntry | null {
  const pool = entries.filter((e) =>
    e.uid !== me.uid && !e.callId && now - e.updatedAt < QUEUE_STALE_MS
    && e.mode === me.mode && relation(me, e) === me.mode
    && accepts(me, e) && accepts(e, me));
  pool.sort((a, b) => a.updatedAt - b.updatedAt);
  return pool[0] ?? null;
}
