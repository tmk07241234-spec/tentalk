/**
 * How long server records are kept (see the privacy policy, "保存期間と削除"). Open
 * reports and inquiries are never removed: only ones an operator has finished with.
 */
const DAY_MS = 24 * 3600 * 1000;

export const RETENTION = {
  /** Call requests are only useful until they are answered or expire (24 hours at most). */
  requests: 30 * DAY_MS,
  /** Matched calls: following someone needs a finished call, so these stay a year. */
  calls: 365 * DAY_MS,
  /** Decided reports: a year of history helps spot repeat offenders. */
  reports: 365 * DAY_MS,
  /** Answered inquiries. */
  inquiries: 365 * DAY_MS,
} as const;

export type RetainedCollection = keyof typeof RETENTION;

/** Whether a record in `collection` created at `createdAt` (with an optional status) can be deleted now. */
export function isExpired(collection: RetainedCollection, record: { createdAt?: unknown; status?: unknown }, now: number): boolean {
  if (typeof record.createdAt !== 'number' || record.createdAt > now - RETENTION[collection]) return false;
  if (collection === 'reports' || collection === 'inquiries') return record.status !== undefined && record.status !== 'open';
  return true;
}
