import { REQUIRED_SECONDS } from './callRules';

/**
 * The practice record and trust score, kept by the server (stats/{uid}) from the call
 * service's own join/leave events, so they cannot be edited from the app.
 * Others see the record (completion rate, practice days, completed calls); only the
 * person sees their trust number.
 */
export interface PracticeStats {
  /** 0–100, starts at 80. */
  trust: number;
  /** Calls both people joined. */
  finished: number;
  /** Calls that reached the required 10 minutes. */
  completed: number;
  /** Days (YYYY-MM-DD, UTC) with a completed call, newest last, at most the last 60. */
  days: string[];
  /** Trust gained today (completed calls add at most DAILY_GAIN per day). */
  gainDay: string;
  gainToday: number;
  /** When this person ended a call early themselves (ms), the latest few. */
  earlyLeaves: number[];
  /** Quick matches paused until (ms). */
  pausedUntil: number;
  /** When this person skipped a quick-match card (ms), the latest ones. */
  skips: number[];
}

export const START_TRUST = 80;
export const DAILY_GAIN = 5;
export const EARLY_LEAVE_PENALTY = -10;
/** Shown as "just started" until this many finished calls, so a rate is not judged on one or two calls. */
export const RECORD_MIN_CALLS = 5;
const DAY_MS = 24 * 3600 * 1000;
/** Quick-match pause after leaving early, by how many early leaves in the last 24 hours. */
const PAUSE_MINUTES = [30, 120, 24 * 60];
/** Searchers with low trust or many recent skips wait this much longer before being matched. */
export const LOW_PRIORITY_DELAY_MS = 20_000;
export const LOW_TRUST = 70;
export const MANY_SKIPS = 10;

export function emptyStats(): PracticeStats {
  return { trust: START_TRUST, finished: 0, completed: 0, days: [], gainDay: '', gainToday: 0, earlyLeaves: [], pausedUntil: 0, skips: [] };
}

export function withDefaults(s: Partial<PracticeStats> | null | undefined): PracticeStats {
  return { ...emptyStats(), ...(s ?? {}) };
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));
export const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Each member's time in the call room, from the call service's events (ms). */
export interface Presence {
  joinedAt?: number;
  leftAt?: number;
  clientLeft?: boolean;
  /** 0 for the first person to leave, 1 for the second: event times are only to the second. */
  leftOrder?: number;
}

/** Seconds both people were in the room together; 0 if either never joined. */
export function talkedSeconds(a: Presence | undefined, b: Presence | undefined, end: number): number {
  if (!a?.joinedAt || !b?.joinedAt) return 0;
  const from = Math.max(a.joinedAt, b.joinedAt);
  const to = Math.min(a.leftAt ?? end, b.leftAt ?? end);
  return Math.max(0, Math.round((to - from) / 1000));
}

/** Small allowance for event timing, so a call ended right at 10:00 counts. */
const TOLERANCE_SECONDS = 5;
export const isCompleted = (seconds: number) => seconds >= REQUIRED_SECONDS - TOLERANCE_SECONDS;

/**
 * Who ended an unfinished call early by their own choice: the first to leave, only if
 * they left on purpose (not a dropped connection) and did not leave by reporting.
 */
export function earlyLeaver(members: readonly string[], presence: Record<string, Presence>, seconds: number, reporters: readonly string[]): string | null {
  if (isCompleted(seconds)) return null;
  const left = members.filter((m) => presence[m]?.leftAt)
    .sort((x, y) => (presence[x].leftAt! - presence[y].leftAt!) || ((presence[x].leftOrder ?? 0) - (presence[y].leftOrder ?? 0)));
  const first = left[0];
  if (!first || !presence[first].clientLeft || reporters.includes(first)) return null;
  return first;
}

/** One person's stats after a call both joined. */
export function afterCall(prev: PracticeStats, input: { seconds: number; leftEarly: boolean; now: number }): PracticeStats {
  const s = { ...prev, days: [...prev.days], earlyLeaves: [...prev.earlyLeaves] };
  const today = dayOf(input.now);
  if (s.gainDay !== today) { s.gainDay = today; s.gainToday = 0; }
  s.finished += 1;
  if (isCompleted(input.seconds)) {
    s.completed += 1;
    if (s.days[s.days.length - 1] !== today) s.days = [...s.days, today].slice(-60);
    if (s.gainToday < DAILY_GAIN) { s.trust = clamp(s.trust + 1); s.gainToday += 1; }
  } else if (input.leftEarly) {
    s.trust = clamp(s.trust + EARLY_LEAVE_PENALTY);
    s.earlyLeaves = [...s.earlyLeaves, input.now].slice(-10);
    const recent = s.earlyLeaves.filter((t) => t > input.now - DAY_MS).length;
    const minutes = PAUSE_MINUTES[Math.min(recent, PAUSE_MINUTES.length) - 1];
    s.pausedUntil = Math.max(s.pausedUntil, input.now + minutes * 60_000);
  }
  return s;
}

/** A trust change from a moderation decision. */
export function withTrustDelta(prev: PracticeStats, delta: number): PracticeStats {
  return { ...prev, trust: clamp(prev.trust + delta) };
}

export function withSkip(prev: PracticeStats, now: number): PracticeStats {
  return { ...prev, skips: [...prev.skips, now].slice(-30) };
}

/** Extra wait before a searcher is matched: low trust or many skips in the last day. */
export function priorityDelay(s: PracticeStats, now: number): number {
  let delay = 0;
  if (s.trust < LOW_TRUST) delay += LOW_PRIORITY_DELAY_MS;
  if (s.skips.filter((t) => t > now - DAY_MS).length >= MANY_SKIPS) delay += LOW_PRIORITY_DELAY_MS;
  return delay;
}

/** What others see. `rate` is null while the person has fewer than RECORD_MIN_CALLS calls. */
export function practiceRecord(s: PracticeStats, now: number): { rate: number | null; days30: number; completed: number } {
  const since = dayOf(now - 30 * DAY_MS);
  return {
    rate: s.finished >= RECORD_MIN_CALLS ? Math.round((s.completed / s.finished) * 100) : null,
    days30: s.days.filter((d) => d > since).length,
    completed: s.completed,
  };
}
