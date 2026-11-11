import { REQUIRED_SECONDS } from '@/domain/callRules';
import { bothAgreed } from '@/domain/consent';
import type { CallRecord } from './calls';
import { HttpError } from './auth';
import { pushTarget, sendPush } from './push';
import { firestore } from './firestore';

/**
 * users/{uid}/private/followers  { ids: [...] }  who follows uid. Only the server writes
 * it, so a person's own app saving their state never overwrites it. The owner's app
 * reads it to show followers and "followed you" notifications.
 */
export async function setFollow(uid: string, to: unknown, on: unknown): Promise<{ ok: true }> {
  if (typeof to !== 'string' || !/^[A-Za-z0-9]{10,40}$/.test(to) || to === uid) throw new HttpError(400, 'Invalid person.');
  const [calls, docs] = await Promise.all([
    on === true ? firestore.where('calls', 'members', uid, 100, undefined, 'ARRAY_CONTAINS') : Promise.resolve([]),
    firestore.getMany([`users/${to}/private/followers`, `users/${to}/private/push`, `users/${to}/private/state`, `users/${uid}`]),
  ]);
  const doc = docs[`users/${to}/private/followers`];
  // Following is earned by talking: the server's own call records (not the app's history,
  // which the app could change) must show a call with this person that began at least
  // 10 minutes ago.
  const talked = calls.some((c) => (c.members as string[]).includes(to) && bothAgreed(c as unknown as CallRecord) && (c.createdAt as number) <= Date.now() - REQUIRED_SECONDS * 1000);
  if (on === true && !talked) throw new HttpError(403, 'not-allowed');
  const ids = Array.isArray(doc?.ids) ? (doc.ids as string[]) : [];
  const next = on === true ? [...new Set([...ids, uid])] : ids.filter((x) => x !== uid);
  if (next.length !== ids.length) {
    await firestore.commit([{ set: `users/${to}/private/followers`, data: { ids: next } }]);
    const notify = (docs[`users/${to}/private/state`]?.settings as { notify?: { followed?: boolean } } | undefined)?.notify;
    if (on === true && notify?.followed !== false) await sendPush(pushTarget(docs[`users/${to}/private/push`]), 'followed', docs[`users/${uid}`]?.name as string | undefined);
  }
  return { ok: true };
}
