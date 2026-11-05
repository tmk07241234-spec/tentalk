import { HttpError } from './auth';
import { firestore, type Data } from './firestore';

/**
 * inquiries/{id}  messages from the in-app contact form, server-only. Operators read
 * them on the admin screen and answer by email from the support address.
 */
const KINDS = ['bug', 'account', 'payment', 'safety', 'other'];
const MAX_PER_DAY = 5;
const newId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);

export interface Inquiry {
  id: string;
  kind: string;
  message: string;
  replyTo: string | null;
  createdAt: number;
}

export async function saveInquiry(uid: string, accountEmail: string | null, body: unknown): Promise<{ ok: true }> {
  const b = (body ?? {}) as Record<string, unknown>;
  const message = typeof b.message === 'string' ? b.message.trim() : '';
  const replyTo = typeof b.replyTo === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.replyTo.trim()) ? b.replyTo.trim().slice(0, 200) : accountEmail;
  if (!KINDS.includes(b.kind as string) || message.length < 10 || message.length > 3000) throw new HttpError(400, 'Invalid inquiry.');
  const mine = await firestore.where('inquiries', 'by', uid, 50);
  if (mine.filter((r) => (r.createdAt as number) > Date.now() - 24 * 3600_000).length >= MAX_PER_DAY) throw new HttpError(429, 'rate-limited');
  await firestore.commit([{ set: `inquiries/${newId()}`, data: { by: uid, kind: b.kind as string, message, replyTo, createdAt: Date.now(), status: 'open' } as Data }]);
  return { ok: true };
}

export async function listInquiries(): Promise<{ inquiries: Inquiry[] }> {
  const open = await firestore.where('inquiries', 'status', 'open', 100);
  return {
    inquiries: open
      .sort((a, b) => (b.createdAt as number) - (a.createdAt as number))
      .map((r) => ({ id: r.id as string, kind: r.kind as string, message: r.message as string, replyTo: (r.replyTo as string | null) ?? null, createdAt: r.createdAt as number })),
  };
}

export async function closeInquiry(adminUid: string, id: unknown): Promise<{ ok: true }> {
  if (typeof id !== 'string' || !/^[a-z0-9]{8,40}$/i.test(id)) throw new HttpError(400, 'Invalid inquiry.');
  const r = await firestore.get(`inquiries/${id}`);
  if (!r) throw new HttpError(404, 'not-found');
  await firestore.commit([{ set: `inquiries/${id}`, data: { ...r, status: 'done', doneBy: adminUid, doneAt: Date.now() } }]);
  return { ok: true };
}
