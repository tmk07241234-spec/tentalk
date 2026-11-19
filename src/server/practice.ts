import { jwtVerify } from 'jose';
import { afterCall, earlyLeaver, talkedSeconds, withDefaults, type PracticeStats, type Presence } from '@/domain/practice';
import { HttpError } from './auth';
import type { CallRecord } from './calls';
import { firestore, type Data } from './firestore';

/**
 * stats/{uid}: practice record and trust, readable by signed-in users, written only here.
 * The call service (LiveKit) sends a webhook when people join and leave a call's room;
 * when both have left, the call is finalized once and both people's stats updated.
 */
type CallDoc = CallRecord & { presence?: Record<string, Presence>; finalized?: boolean; talkedSeconds?: number; completedAt?: number };

interface WebhookEvent {
  event?: string;
  createdAt?: string | number;
  room?: { name?: string };
  participant?: { identity?: string; disconnectReason?: string | number };
}

/** Checks the call service's signature: a JWT signed with our API secret carrying the body's SHA-256. */
export async function verifyWebhook(body: string, auth: string | null): Promise<WebhookEvent> {
  const key = process.env.LIVEKIT_API_KEY, secret = process.env.LIVEKIT_API_SECRET;
  if (!key || !secret || !auth) throw new HttpError(401, 'Unauthorized.');
  const token = auth.replace(/^Bearer\s+/i, '');
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { issuer: key }).catch(() => { throw new HttpError(401, 'Unauthorized.'); });
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body)));
  const sha = btoa(String.fromCharCode(...digest));
  if (payload.sha256 !== sha) throw new HttpError(401, 'Unauthorized.');
  return JSON.parse(body) as WebhookEvent;
}

const isClientLeave = (r: unknown) => r === 'CLIENT_INITIATED' || r === 1;

export async function onCallEvent(ev: WebhookEvent): Promise<{ ok: true }> {
  const callId = ev.room?.name;
  if (!callId || !/^[a-z0-9]{8,40}$/i.test(callId)) return { ok: true };
  const kind = ev.event;
  if (kind !== 'participant_joined' && kind !== 'participant_left' && kind !== 'room_finished') return { ok: true };
  const at = ev.createdAt ? Number(ev.createdAt) * 1000 : Date.now();
  const uid = ev.participant?.identity;

  const tx = await firestore.begin();
  const call = (await firestore.get(`calls/${callId}`, tx)) as unknown as CallDoc | null;
  if (!call || call.finalized) { await firestore.commit([], tx).catch(() => {}); return { ok: true }; }
  const presence: Record<string, Presence> = { ...(call.presence ?? {}) };
  if (uid && call.members.includes(uid)) {
    const p = { ...(presence[uid] ?? {}) };
    if (kind === 'participant_joined') { p.joinedAt = p.joinedAt ?? at; delete p.leftAt; }
    if (kind === 'participant_left') {
      // Events arrive in order but carry whole seconds, and the partner's app leaves right
      // after: the order of arrival tells who ended the call.
      p.leftAt = at;
      p.clientLeft = isClientLeave(ev.participant?.disconnectReason);
      p.leftOrder = call.members.filter((m) => m !== uid && presence[m]?.leftAt).length;
    }
    presence[uid] = p;
  }
  const allLeft = call.members.every((m) => !presence[m]?.joinedAt || presence[m].leftAt);
  const done = kind === 'room_finished' || (kind === 'participant_left' && allLeft);
  if (!done) {
    await firestore.commit([{ set: `calls/${callId}`, data: { ...call, presence } as unknown as Data }], tx);
    return { ok: true };
  }

  const [a, b] = call.members;
  const seconds = talkedSeconds(presence[a], presence[b], at);
  const writes: { set: string; data: Data }[] = [];
  if (seconds > 0) {
    const [stats, reports] = await Promise.all([
      firestore.getMany([`stats/${a}`, `stats/${b}`], tx),
      firestore.where('reports', 'callId', callId, 5),
    ]);
    const leaver = earlyLeaver(call.members, presence, seconds, reports.map((r) => r.by as string));
    for (const m of call.members) {
      const next = afterCall(withDefaults(stats[`stats/${m}`] as Partial<PracticeStats> | null), { seconds, leftEarly: leaver === m, now: at });
      writes.push({ set: `stats/${m}`, data: next as unknown as Data });
    }
  }
  writes.push({ set: `calls/${callId}`, data: { ...call, presence, finalized: true, talkedSeconds: seconds, ...(seconds >= 595 ? { completedAt: at } : {}) } as unknown as Data });
  await firestore.commit(writes, tx).catch((e) => { if (!String(e).includes(': 409')) throw e; });
  return { ok: true };
}

/** Today's numbers for the operator screen (UTC day). */
export async function dailyCounts(now = Date.now()): Promise<{ users: number; activeToday: number; callsToday: number; completedToday: number }> {
  const start = Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate());
  const [users, activeToday, callsToday, completedToday] = await Promise.all([
    firestore.count('users'),
    firestore.count('users', { field: 'lastSeen', min: start }),
    firestore.count('calls', { field: 'createdAt', min: start }),
    firestore.count('calls', { field: 'completedAt', min: start }),
  ]);
  return { users, activeToday, callsToday, completedToday };
}
