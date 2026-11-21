import { LANGS, type Lang } from '@/domain/languages';
import { isSuspended, type ModerationRecord } from '@/domain/moderation';
import { canSendWake, pickWakeTargets, type WakeCandidate } from '@/domain/wake';
import { ONLINE_WINDOW_MS } from '@/domain/presence';
import type { MatchRequest } from './calls';
import { firestore, type Data } from './firestore';
import { pushTarget, sendPushMany, type PushTarget } from './push';

/** How many profiles are looked at for one search. */
const LOOK_AT = 30;
/** How many of them are checked in detail (push, settings, last push). */
const CHECK = 12;

const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v);

/**
 * At the start of a quick-match search with nobody waiting: tells a few people who
 * could be matched that someone is looking (see domain/wake). Never says who.
 * Returns how many were notified.
 */
export async function wakePartners(uid: string, req: MatchRequest): Promise<{ notified: number }> {
  const now = Date.now();
  const own = await firestore.getMany([`wake/${uid}`, `users/${uid}/private/state`, `users/${uid}/private/moderation`]);
  if (isSuspended(own[`users/${uid}/private/moderation`] as ModerationRecord | null)) return { notified: 0 };
  if (!canSendWake(Number(own[`wake/${uid}`]?.sentAt ?? 0), now)) return { notified: 0 };
  const myBlocked = Array.isArray(own[`users/${uid}/private/state`]?.blocked) ? (own[`users/${uid}/private/state`]!.blocked as string[]) : [];

  // Exchange partners are natives of the language I learn; practice buddies learn it too.
  const rows = req.mode === 'exchange'
    ? await firestore.where('users', 'native', req.learn, LOOK_AT)
    : await firestore.where('users', 'learnLangs', req.learn, LOOK_AT, undefined, 'ARRAY_CONTAINS');
  const profiles = rows
    .filter((r) => r.id !== uid && isLang(r.native) && !myBlocked.includes(r.id))
    .map((r) => ({ id: r.id, native: r.native as Lang, learnLangs: (Array.isArray(r.learnLangs) ? r.learnLangs : []).filter(isLang),
      utcOffset: Number(r.utcOffset ?? 0), lastSeen: Number(r.lastSeen ?? 0), inCall: r.inCall === true }))
    .filter((p) => now - p.lastSeen > ONLINE_WINDOW_MS && !p.inCall)
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .slice(0, CHECK);
  if (!profiles.length) return { notified: 0 };

  const paths = profiles.flatMap((p) => [`users/${p.id}/private/push`, `users/${p.id}/private/state`, `wake/${p.id}`]);
  const docs = await firestore.getMany(paths);
  const targets = new Map<string, PushTarget>();
  const candidates: WakeCandidate[] = profiles.map((p) => {
    const push = pushTarget(docs[`users/${p.id}/private/push`]);
    if (push) targets.set(p.id, push);
    const state = docs[`users/${p.id}/private/state`] as Data | null;
    const notify = (state?.settings as { notify?: { searching?: boolean } } | undefined)?.notify;
    return { ...p, hasPush: !!push, wantsWake: notify?.searching !== false, lastWakeAt: Number(docs[`wake/${p.id}`]?.receivedAt ?? 0),
      blocked: Array.isArray(state?.blocked) ? (state.blocked as string[]) : [] };
  });
  const chosen = pickWakeTargets({ uid, native: req.native, learn: req.learn, mode: req.mode, blocked: myBlocked }, candidates, now, ONLINE_WINDOW_MS);
  // Remember the searcher's attempt even when nobody fits, so repeated searches do not query again and again.
  await firestore.commit([
    { set: `wake/${uid}`, data: { ...(own[`wake/${uid}`] ?? {}), sentAt: now } },
    ...chosen.map((c) => ({ set: `wake/${c.id}`, data: { ...(docs[`wake/${c.id}`] ?? {}), receivedAt: now } })),
  ]);
  await sendPushMany(chosen.map((c) => targets.get(c.id)!), 'searching', { mode: req.mode, learn: req.mode === 'exchange' ? req.native : req.learn });
  return { notified: chosen.length };
}
