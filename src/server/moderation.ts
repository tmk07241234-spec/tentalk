import { decide, MODERATION_ACTIONS, withEvent, type ModerationAction, type ModerationRecord } from '@/domain/moderation';
import { HttpError } from './auth';
import { firestore, type Data } from './firestore';

const RECENT_MS = 30 * 24 * 3600 * 1000;

export interface ReportRow {
  id: string;
  reason: string;
  createdAt: number;
  by: { id: string; name: string };
  against: { id: string; name: string; reportsIn30Days: number; suspendedUntil: number };
}

/** Open reports, newest first, with names and how often the reported person was reported lately. */
export async function listReports(): Promise<{ reports: ReportRow[] }> {
  const recent = await firestore.since('reports', 'createdAt', Date.now() - RECENT_MS, 300);
  const open = recent.filter((r) => r.status === 'open').sort((a, b) => (b.createdAt as number) - (a.createdAt as number)).slice(0, 50);
  const ids = [...new Set(open.flatMap((r) => [r.by as string, r.against as string]))];
  const docs = ids.length ? await firestore.getMany(ids.flatMap((id) => [`users/${id}`, `users/${id}/private/moderation`])) : {};
  const name = (id: string) => (docs[`users/${id}`]?.name as string | undefined) ?? '—';
  const count = (id: string) => recent.filter((r) => r.against === id).length;
  return {
    reports: open.map((r) => ({
      id: r.id, reason: r.reason as string, createdAt: r.createdAt as number,
      by: { id: r.by as string, name: name(r.by as string) },
      against: {
        id: r.against as string, name: name(r.against as string), reportsIn30Days: count(r.against as string),
        suspendedUntil: (docs[`users/${r.against}/private/moderation`]?.suspendedUntil as number | undefined) ?? 0,
      },
    })),
  };
}

/** Applies an operator's decision: closes the report and records the outcome for both people. */
export async function actOnReport(adminUid: string, id: unknown, action: unknown): Promise<{ ok: true }> {
  if (typeof id !== 'string' || !/^[a-z0-9]{8,40}$/i.test(id)) throw new HttpError(400, 'Invalid report.');
  if (!MODERATION_ACTIONS.includes(action as ModerationAction)) throw new HttpError(400, 'Invalid action.');
  const report = await firestore.get(`reports/${id}`);
  if (!report) throw new HttpError(404, 'not-found');
  if (report.status !== 'open') throw new HttpError(409, 'already-decided');
  const by = report.by as string, against = report.against as string;
  const paths = { by: `users/${by}/private/moderation`, against: `users/${against}/private/moderation` };
  const docs = await firestore.getMany([paths.by, paths.against]);
  const now = Date.now();
  const d = decide(action as ModerationAction, id, now);
  await firestore.commit([
    { set: `reports/${id}`, data: { ...report, status: d.status, action: action as string, decidedBy: adminUid, decidedAt: now } },
    { set: paths.by, data: withEvent(docs[paths.by] as ModerationRecord | null, d.reporter) as unknown as Data },
    ...(d.against ? [{ set: paths.against, data: withEvent(docs[paths.against] as ModerationRecord | null, d.against) as unknown as Data }] : []),
  ]);
  return { ok: true };
}
