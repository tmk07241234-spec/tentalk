import { acceptsRequestFrom, type RequestRules } from '@/domain/connections';
import { relation, type Mode } from '@/domain/matching';
import { HttpError } from './auth';
import { firestore, type Data } from './firestore';

/**
 * requests/{id}  a 10-minute call request. "now" requests go to someone online and
 * expire after a minute; "later" ones wait up to a day for someone offline. The two
 * people can read their requests (firestore.rules); only the server writes them.
 */
export interface RequestRecord {
  from: string;
  to: string;
  kind: 'now' | 'later';
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  mode: Mode;
  createdAt: number;
  expiresAt: number;
  answeredAt: number | null;
  callId: string | null;
}

const NOW_MS = 60_000;
const LATER_MS = 24 * 3600_000;
const ONLINE_WINDOW_MS = 150_000;
const newId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);

interface ProfileDoc { native: string; learnLangs?: string[]; learning?: { lang: string }[]; lastSeen?: number; inCall?: boolean }

const learns = (p: ProfileDoc) => p.learnLangs ?? (p.learning ?? []).map((l) => l.lang);

/** How two people relate in any pair of their learning languages; exchange wins over buddy. */
function pairMode(a: ProfileDoc, b: ProfileDoc): Mode | null {
  let found: Mode | null = null;
  for (const la of learns(a)) for (const lb of learns(b)) {
    const m = relation({ native: a.native as never, learn: la as never }, { native: b.native as never, learn: lb as never });
    if (m === 'exchange') return m;
    found = found ?? m;
  }
  return found;
}

export async function sendRequest(uid: string, to: unknown): Promise<{ id: string; kind: RequestRecord['kind'] }> {
  if (typeof to !== 'string' || !/^[A-Za-z0-9]{10,40}$/.test(to) || to === uid) throw new HttpError(400, 'Invalid person.');
  const [mine, theirs, theirState, theirFollowers] = await Promise.all([
    firestore.get(`users/${uid}`), firestore.get(`users/${to}`), firestore.get(`users/${to}/private/state`), firestore.get(`users/${to}/private/followers`),
  ]) as [ProfileDoc | null, ProfileDoc | null, Data | null, Data | null];
  if (!mine || !theirs) throw new HttpError(404, 'not-found');
  const settings = (theirState?.settings ?? {}) as Partial<RequestRules>;
  const rules: RequestRules = { requestsFrom: settings.requestsFrom ?? 'everyone', requestAllowList: settings.requestAllowList ?? [] };
  const list = (d: Data | null, k: string) => (Array.isArray(d?.[k]) ? (d[k] as string[]) : []);
  const them = { following: list(theirState, 'following'), followers: list(theirFollowers, 'ids'), blocked: list(theirState, 'blocked') };
  if (!acceptsRequestFrom(rules, them, uid)) {
    throw new HttpError(403, 'not-accepting');
  }
  const mode = pairMode(mine, theirs);
  if (!mode) throw new HttpError(400, 'no-shared-language');
  const online = !!theirs.lastSeen && Date.now() - theirs.lastSeen < ONLINE_WINDOW_MS;
  if (online && theirs.inCall) throw new HttpError(409, 'busy');
  const kind = online ? 'now' : 'later';
  const id = newId();
  const now = Date.now();
  const record: RequestRecord = { from: uid, to, kind, status: 'pending', mode, createdAt: now, expiresAt: now + (kind === 'now' ? NOW_MS : LATER_MS), answeredAt: null, callId: null };
  await firestore.commit([{ set: `requests/${id}`, data: record as unknown as Data }]);
  return { id, kind };
}

async function load(id: unknown): Promise<[string, RequestRecord]> {
  if (typeof id !== 'string' || !/^[a-z0-9]{8,40}$/i.test(id)) throw new HttpError(400, 'Invalid request.');
  const r = (await firestore.get(`requests/${id}`)) as unknown as RequestRecord | null;
  if (!r) throw new HttpError(404, 'not-found');
  return [id, r];
}

/** The receiver's answer. Accepting a "now" request creates the call both join. */
export async function answerRequest(uid: string, id: unknown, accept: unknown): Promise<{ callId: string | null }> {
  const [rid, r] = await load(id);
  if (r.to !== uid) throw new HttpError(404, 'not-found');
  if (r.status !== 'pending' || r.expiresAt < Date.now()) throw new HttpError(410, 'expired');
  const answeredAt = Date.now();
  if (accept !== true) {
    await firestore.commit([{ set: `requests/${rid}`, data: { ...r, status: 'declined', answeredAt } as unknown as Data }]);
    return { callId: null };
  }
  const callId = r.kind === 'now' ? newId() : null;
  await firestore.commit([
    ...(callId ? [{ set: `calls/${callId}`, data: { members: [r.from, r.to], kind: 'direct', mode: r.mode, createdAt: answeredAt } }] : []),
    { set: `requests/${rid}`, data: { ...r, status: 'accepted', answeredAt, callId } as unknown as Data },
  ]);
  return { callId };
}

export async function cancelRequest(uid: string, id: unknown): Promise<{ ok: true }> {
  const [rid, r] = await load(id);
  if (r.from !== uid) throw new HttpError(404, 'not-found');
  if (r.status === 'pending') await firestore.commit([{ set: `requests/${rid}`, data: { ...r, status: 'cancelled' } as unknown as Data }]);
  return { ok: true };
}
