import { canFollow, type CallRecord } from '@/domain/connections';
import { HttpError } from './auth';
import { firestore } from './firestore';

/**
 * users/{uid}/private/followers  { ids: [...] }  who follows uid. Only the server writes
 * it, so a person's own app saving their state never overwrites it. The owner's app
 * reads it to show followers and "followed you" notifications.
 */
export async function setFollow(uid: string, to: unknown, on: unknown): Promise<{ ok: true }> {
  if (typeof to !== 'string' || !/^[A-Za-z0-9]{10,40}$/.test(to) || to === uid) throw new HttpError(400, 'Invalid person.');
  const [state, doc] = await Promise.all([firestore.get(`users/${uid}/private/state`), firestore.get(`users/${to}/private/followers`)]);
  // Following is earned by finishing a 10-minute call; the server checks the history too.
  if (on === true && !canFollow((state?.history ?? []) as CallRecord[], to)) throw new HttpError(403, 'not-allowed');
  const ids = Array.isArray(doc?.ids) ? (doc.ids as string[]) : [];
  const next = on === true ? [...new Set([...ids, uid])] : ids.filter((x) => x !== uid);
  if (next.length !== ids.length) await firestore.commit([{ set: `users/${to}/private/followers`, data: { ids: next } }]);
  return { ok: true };
}
