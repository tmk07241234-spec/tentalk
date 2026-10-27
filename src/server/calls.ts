import { LANGS, type Lang } from '@/domain/languages';
import { isSuspended, type ModerationRecord } from '@/domain/moderation';
import { pickQueuePartner, queueKey, seekKey, type QueueEntry } from '@/domain/queue';
import { HttpError } from './auth';
import { firestore, type Data } from './firestore';

/**
 * Server-side call records.
 * queue/{uid}   one waiting entry per person searching for a random call
 * calls/{id}    a matched call: its two members and mode
 * reports/{id}  reports sent from calls, for review
 * None of these are readable by the app directly (the security rules deny them).
 */
export interface CallRecord {
  members: [string, string];
  kind: 'random' | 'direct';
  mode: 'buddy' | 'exchange';
  createdAt: number;
}

export type MatchRequest = Pick<QueueEntry, 'mode' | 'native' | 'learn' | 'level' | 'languageOnly' | 'wantLanguageOnly' | 'matchLevel'>;

const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v);

export function parseMatchRequest(body: unknown): MatchRequest {
  const b = (body ?? {}) as Record<string, unknown>;
  const level = Number(b.level);
  if ((b.mode !== 'buddy' && b.mode !== 'exchange') || !isLang(b.native) || !isLang(b.learn) || b.native === b.learn
    || !Number.isInteger(level) || level < 1 || level > 5) {
    throw new HttpError(400, 'Invalid search settings.');
  }
  return {
    mode: b.mode, native: b.native, learn: b.learn, level: level as QueueEntry['level'],
    languageOnly: b.languageOnly === true, wantLanguageOnly: b.wantLanguageOnly === true, matchLevel: b.matchLevel === true,
  };
}

const newId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);

/**
 * One step of a random-call search. Called every few seconds while searching:
 * picks up a call someone else matched us into, matches us with the longest-waiting
 * compatible person, or (re)places our entry in the queue.
 */
export async function searchStep(uid: string, req: MatchRequest): Promise<{ callId: string } | { waiting: true }> {
  const docs = await firestore.getMany([`users/${uid}/private/state`, `users/${uid}/private/moderation`]);
  if (isSuspended(docs[`users/${uid}/private/moderation`] as ModerationRecord | null)) throw new HttpError(403, 'suspended');
  const state = docs[`users/${uid}/private/state`];
  const blocked = Array.isArray(state?.blocked) ? (state.blocked as string[]) : [];
  const me: QueueEntry = { uid, ...req, blocked, updatedAt: Date.now(), callId: null };

  // EAS Hosting allows only a few outside requests per API call, so a step makes one
  // attempt; when two people collide, the losing side tries again on its next step.
  const tx = await firestore.begin();
  try {
    const mine = await firestore.get(`queue/${uid}`, tx);
    if (mine?.callId) {
      await firestore.commit([{ delete: `queue/${uid}` }], tx);
      return { callId: mine.callId as string };
    }
    const rows = await firestore.where('queue', 'key', seekKey(me), 25, tx);
    const partner = pickQueuePartner(me, rows as unknown as QueueEntry[], Date.now());
    if (partner) {
      const callId = newId();
      const call: CallRecord = { members: [partner.uid, uid], kind: 'random', mode: me.mode, createdAt: Date.now() };
      await firestore.commit([
        { set: `calls/${callId}`, data: call as unknown as Data },
        { set: `queue/${partner.uid}`, data: { ...partner, key: queueKey(partner), callId } as unknown as Data },
        { delete: `queue/${uid}` },
      ], tx);
      return { callId };
    }
    await firestore.commit([{ set: `queue/${uid}`, data: { ...me, key: queueKey(me) } as unknown as Data }], tx);
    return { waiting: true };
  } catch (e) {
    if (String(e).includes(': 409')) return { waiting: true };
    throw e;
  }
}

/** Leaves the queue. A match that landed at the same moment is returned so it is not lost. */
export async function cancelSearch(uid: string): Promise<{ callId: string | null }> {
  const mine = await firestore.get(`queue/${uid}`);
  await firestore.commit([{ delete: `queue/${uid}` }]);
  return { callId: (mine?.callId as string | undefined) ?? null };
}

export async function callFor(uid: string, callId: string): Promise<CallRecord> {
  if (!/^[a-z0-9]{8,40}$/i.test(callId)) throw new HttpError(400, 'Invalid call.');
  const call = (await firestore.get(`calls/${callId}`)) as unknown as CallRecord | null;
  if (!call || !call.members.includes(uid)) throw new HttpError(404, 'Call not found.');
  return call;
}

export async function saveReport(uid: string, callId: string, reason: string): Promise<void> {
  const call = await callFor(uid, callId);
  const against = call.members.find((m) => m !== uid)!;
  await firestore.commit([{ set: `reports/${newId()}`, data: { by: uid, against, callId, reason: reason.slice(0, 40), createdAt: Date.now(), status: 'open' } }]);
}
