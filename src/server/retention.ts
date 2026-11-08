import { RETENTION, isExpired, type RetainedCollection } from '@/domain/retention';
import { firestore } from './firestore';

/** At most this many records per collection per run, so one request stays small. */
const BATCH = 100;

/**
 * Deletes server records past their retention period. Runs when an operator opens the
 * admin screen, which is often enough for a small service and needs no scheduler.
 */
export async function purgeExpired(now = Date.now()): Promise<{ deleted: Record<RetainedCollection, number> }> {
  const collections = Object.keys(RETENTION) as RetainedCollection[];
  const found = await Promise.all(collections.map((c) => firestore.before(c, 'createdAt', now - RETENTION[c], BATCH)));
  const deleted = {} as Record<RetainedCollection, number>;
  const paths: string[] = [];
  collections.forEach((c, i) => {
    const old = found[i].filter((r) => isExpired(c, { createdAt: r.createdAt, status: r.status }, now));
    deleted[c] = old.length;
    paths.push(...old.map((r) => `${c}/${r.id}`));
  });
  if (paths.length) await firestore.commit(paths.map((p) => ({ delete: p })));
  return { deleted };
}
