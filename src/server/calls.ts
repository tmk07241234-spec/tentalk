import { MAX_AVOID, consentStatus, type Consent, type ConsentStatus } from '@/domain/consent';
import { LANGS, type Lang } from '@/domain/languages';
import { isSuspended, type ModerationRecord } from '@/domain/moderation';
import { pickQueuePartner, queueKey, seekKey, type QueueEntry } from '@/domain/queue';
import { HttpError } from './auth';
import { alertOperators } from './operators';
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
  /** Quick matches: each member's choice to talk (true) or skip (false); see domain/consent. */
  consent?: Consent;
}

export type MatchRequest = Pick<QueueEntry, 'mode' | 'native' | 'learn' | 'level' | 'languageOnly' | 'wantLanguageOnly' | 'matchLevel'> & {
  /** People skipped earlier in this search, not offered again. */
  avoid: string[];
};

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
    avoid: Array.isArray(b.avoid) ? b.avoid.filter((x): x is string => typeof x === 'string' && /^[A-Za-z0-9]{10,40}$/.test(x)).slice(0, MAX_AVOID) : [],
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
  const { avoid, ...prefs } = req;
  const me: QueueEntry = { uid, ...prefs, blocked: [...new Set([...blocked, ...avoid])], updatedAt: Date.now(), callId: null };

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
    const partner = pickQueuePartner(me, rows.map(({ id: _id, ...e }) => e) as unknown as QueueEntry[], Date.now());
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

/**
 * A quick-match member's choice before the call: accept true (talk) or false (skip), or
 * undefined to just read the state. Returns who the partner is and whether the call goes
 * ahead. The app repeats its choice while waiting, so a lost write is simply sent again.
 */
export async function consentStep(uid: string, callId: string, accept: unknown): Promise<{ partnerId: string; mode: CallRecord['mode']; status: ConsentStatus }> {
  const call = await callFor(uid, callId);
  const partnerId = call.members.find((m) => m !== uid)!;
  if (call.kind !== 'random') return { partnerId, mode: call.mode, status: 'go' };
  let consent = call.consent ?? {};
  if ((accept === true || accept === false) && consent[uid] !== accept && consent[uid] !== false) {
    const tx = await firestore.begin();
    try {
      const fresh = ((await firestore.get(`calls/${callId}`, tx)) ?? call) as unknown as CallRecord;
      consent = { ...(fresh.consent ?? {}), [uid]: accept };
      await firestore.commit([{ set: `calls/${callId}`, data: { ...fresh, consent } as unknown as Data }], tx);
    } catch (e) {
      // Both chose at the same moment: this side's choice is sent again on the next step.
      if (!String(e).includes(': 409')) throw e;
    }
  }
  return { partnerId, mode: call.mode, status: consentStatus(call.members, consent, call.createdAt, Date.now()) };
}

export async function callFor(uid: string, callId: string): Promise<CallRecord> {
  if (!/^[a-z0-9]{8,40}$/i.test(callId)) throw new HttpError(400, 'Invalid call.');
  const call = (await firestore.get(`calls/${callId}`)) as unknown as CallRecord | null;
  if (!call || !call.members.includes(uid)) throw new HttpError(404, 'Call not found.');
  return call;
}

const MAX_REPORTS_PER_DAY = 10;

/**
 * A report from a call (callId) or about a profile (against: the person's id).
 * One per call or person, and a daily cap, so reports cannot flood the review queue.
 */
export async function saveReport(uid: string, input: { callId?: string; against?: string }, reason: string): Promise<void> {
  const [call, mine] = await Promise.all([
    input.callId ? callFor(uid, input.callId) : Promise.resolve(null),
    firestore.where('reports', 'by', uid, 100),
  ]);
  const against = call ? call.members.find((m) => m !== uid)! : input.against;
  if (!against || !/^[A-Za-z0-9]{10,40}$/.test(against) || against === uid) throw new HttpError(400, 'Invalid report.');
  const callId = input.callId ?? null;
  if (mine.some((r) => (callId ? r.callId === callId : !r.callId && r.against === against))) return;
  if (mine.filter((r) => (r.createdAt as number) > Date.now() - 24 * 3600_000).length >= MAX_REPORTS_PER_DAY) throw new HttpError(429, 'rate-limited');
  await firestore.commit([{ set: `reports/${newId()}`, data: { by: uid, against, callId, reason: reason.slice(0, 40), createdAt: Date.now(), status: 'open' } }]);
  // Reports are reviewed within 24 hours: tell the operators right away.
  await alertOperators().catch((e) => console.error('operators', e));
}
