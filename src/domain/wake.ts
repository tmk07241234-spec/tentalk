import type { Lang } from './languages';
import { relation, type Mode } from './matching';

/**
 * "Someone is looking for a partner" notifications (1.3). When a quick-match search
 * starts and nobody is waiting, a few people who could be matched and are not in the
 * app get a push, so a small community can still find each other without a fixed time.
 * Kept gentle: opt-out in settings, no night-time pushes, and long gaps between them.
 */

/** A person gets at most one such push in this time. */
export const WAKE_RECEIVE_GAP_MS = 3 * 60 * 60 * 1000;
/** A searcher can send pushes this often at most. */
export const WAKE_SEND_GAP_MS = 10 * 60 * 1000;
/** People woken by one search. */
export const WAKE_MAX = 5;
/** No pushes from 23:00 to 08:00 in the person's own time. */
export const QUIET_FROM = 23;
export const QUIET_UNTIL = 8;

export interface WakeCandidate {
  id: string;
  native: Lang;
  learnLangs: Lang[];
  /** Minutes east of UTC, from the profile. */
  utcOffset: number;
  lastSeen: number;
  inCall: boolean;
  hasPush: boolean;
  /** Their "someone is searching" setting; missing means on. */
  wantsWake: boolean;
  lastWakeAt: number;
  blocked: string[];
}

export function localHour(utcOffset: number, now: number): number {
  return new Date(now + utcOffset * 60_000).getUTCHours();
}

export const isQuietHour = (hour: number) => hour >= QUIET_FROM || hour < QUIET_UNTIL;

/** Whether the searcher may send wake pushes now. */
export const canSendWake = (lastSentAt: number, now: number) => now - lastSentAt >= WAKE_SEND_GAP_MS;

/** Whether this person could take part in a search of this mode and languages. */
export function couldMatch(c: Pick<WakeCandidate, 'native' | 'learnLangs'>, me: { native: Lang; learn: Lang; mode: Mode }): boolean {
  return c.learnLangs.some((learn) => relation(me, { native: c.native, learn }) === me.mode);
}

/**
 * Who gets a push: people who could be matched, are not online or in a call, allow
 * these pushes, are awake, have not had one recently, and neither side has blocked the
 * other. The most recently active come first.
 */
export function pickWakeTargets(searcher: { uid: string; native: Lang; learn: Lang; mode: Mode; blocked: string[] }, candidates: readonly WakeCandidate[], now: number, onlineWindowMs: number): WakeCandidate[] {
  return candidates
    .filter((c) => c.id !== searcher.uid && c.hasPush && c.wantsWake && !c.inCall
      && now - c.lastSeen > onlineWindowMs
      && now - c.lastWakeAt >= WAKE_RECEIVE_GAP_MS
      && !isQuietHour(localHour(c.utcOffset, now))
      && !searcher.blocked.includes(c.id) && !c.blocked.includes(searcher.uid)
      && couldMatch(c, searcher))
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .slice(0, WAKE_MAX);
}
