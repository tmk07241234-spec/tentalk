/**
 * Limits on call requests, so nobody can flood another person (or everyone) with them.
 * Kept by the server per sender; see server/requests.
 */
export const SAME_PERSON_NOW_MINUTES = 10;
export const DECLINED_COOLDOWN_HOURS = 24;
export const MAX_PER_HOUR = 10;
export const MAX_PER_DAY = 30;

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export interface RequestLimits {
  /** When each recent request was sent (last 24 hours). */
  sent: number[];
  /** The last request to each person still in effect: its kind, when, and when it expires. */
  lastTo: Record<string, { kind: 'now' | 'later'; at: number; until: number }>;
  /** When each person last declined my request. */
  declinedBy: Record<string, number>;
}

export type LimitReason = 'too-soon' | 'already-pending' | 'declined-recently' | 'rate-limited';

export const emptyLimits = (): RequestLimits => ({ sent: [], lastTo: {}, declinedBy: {} });

/** Why a new request to `to` is not allowed now, or null when it is. */
export function requestBlocked(l: RequestLimits, to: string, now: number): LimitReason | null {
  const declined = l.declinedBy[to];
  if (declined !== undefined && declined + DECLINED_COOLDOWN_HOURS * HOUR > now) return 'declined-recently';
  const last = l.lastTo[to];
  if (last && last.kind === 'later' && last.until > now) return 'already-pending';
  if (last && last.kind === 'now' && last.at + SAME_PERSON_NOW_MINUTES * MIN > now) return 'too-soon';
  const recent = l.sent.filter((t) => t > now - DAY);
  if (recent.filter((t) => t > now - HOUR).length >= MAX_PER_HOUR || recent.length >= MAX_PER_DAY) return 'rate-limited';
  return null;
}

/** Records a sent request (dropping data older than a day). */
export function withSent(l: RequestLimits, to: string, kind: 'now' | 'later', now: number, until: number): RequestLimits {
  const lastTo = Object.fromEntries(Object.entries(l.lastTo).filter(([, x]) => x.until > now - DAY));
  const declinedBy = Object.fromEntries(Object.entries(l.declinedBy).filter(([, at]) => at > now - DAY));
  return { sent: [...l.sent.filter((t) => t > now - DAY), now], lastTo: { ...lastTo, [to]: { kind, at: now, until } }, declinedBy };
}

/**
 * The receiver answered. Accepting clears the limit on that person (so "call now" after
 * an accepted request works); declining blocks new requests to them for a day.
 */
export function withAnswer(l: RequestLimits, to: string, accepted: boolean, now: number): RequestLimits {
  const { [to]: _done, ...lastTo } = l.lastTo;
  return accepted ? { ...l, lastTo } : { ...l, lastTo, declinedBy: { ...l.declinedBy, [to]: now } };
}
