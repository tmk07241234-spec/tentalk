import { EARLY_HANGUP_PENALTY, VIOLATION_PENALTY } from './callRules';

/**
 * What an operator decides about a report, and what each side is told.
 * dismiss      no violation found
 * violation    confirmed: the reported person loses trust
 * suspend      confirmed and serious: also no calls for SUSPENSION_DAYS
 * falseReport  the report itself was abuse: the reporter loses trust
 */
export type ModerationAction = 'dismiss' | 'violation' | 'suspend' | 'falseReport';
export const MODERATION_ACTIONS: ModerationAction[] = ['dismiss', 'violation', 'suspend', 'falseReport'];

/** violation / suspended / falseReport: a penalty for this person. reportConfirmed / reportDismissed: the outcome of their report. */
export type ModerationEventKind = 'violation' | 'suspended' | 'falseReport' | 'reportConfirmed' | 'reportDismissed';

/** One decision as seen by the person it concerns; the app applies each event once. */
export interface ModerationEvent {
  id: string;
  kind: ModerationEventKind;
  trustDelta: number;
  /** Suspensions: when calls open again (ms). */
  until: number | null;
  at: number;
}

/** users/{uid}/private/moderation, written only by the server. */
export interface ModerationRecord {
  suspendedUntil: number;
  events: ModerationEvent[];
}

export const SUSPENSION_DAYS = 7;
const DAY_MS = 24 * 3600 * 1000;

export function isSuspended(m: Pick<ModerationRecord, 'suspendedUntil'> | null | undefined, now = Date.now()): boolean {
  return !!m && m.suspendedUntil > now;
}

/** The events a decision creates for the reported person and for the reporter. */
export function decide(action: ModerationAction, eventId: string, now: number): {
  status: 'dismissed' | 'confirmed' | 'false';
  against: ModerationEvent | null;
  reporter: ModerationEvent;
} {
  const ev = (kind: ModerationEventKind, trustDelta: number, until: number | null = null): ModerationEvent =>
    ({ id: `${eventId}-${kind}`, kind, trustDelta, until, at: now });
  switch (action) {
    case 'dismiss': return { status: 'dismissed', against: null, reporter: ev('reportDismissed', 0) };
    case 'violation': return { status: 'confirmed', against: ev('violation', VIOLATION_PENALTY), reporter: ev('reportConfirmed', 0) };
    case 'suspend': return { status: 'confirmed', against: ev('suspended', VIOLATION_PENALTY, now + SUSPENSION_DAYS * DAY_MS), reporter: ev('reportConfirmed', 0) };
    case 'falseReport': return { status: 'false', against: null, reporter: ev('falseReport', EARLY_HANGUP_PENALTY) };
  }
}

/** Adds an event to a person's record, keeping the latest 50. */
export function withEvent(m: ModerationRecord | null, e: ModerationEvent): ModerationRecord {
  const prev = m ?? { suspendedUntil: 0, events: [] };
  return { suspendedUntil: Math.max(prev.suspendedUntil, e.until ?? 0), events: [...prev.events, e].slice(-50) };
}
