import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';

import { acceptsRequestFrom } from '@/domain/connections';
import { ACCEPTED_CALLABLE_HOURS, ONLINE_REQUEST_SECONDS } from '@/domain/schedule';
import { useApp } from '@/state/store';
import { api } from './api';
import { db } from './firebase/db';

export type RequestAnswer = 'accepted' | 'declined' | 'expired';

/**
 * Call-request boundary. There is no messaging: a request is only "can we talk
 * for 10 minutes now?". The real version goes through the server and push notifications.
 */
export interface RequestService {
  /** Partner is online: resolves when they answer, or 'expired' after 60 seconds. */
  askNow(partnerId: string, signal: AbortSignal): Promise<RequestAnswer>;
  /** Partner is offline: the server holds the request; acceptance arrives as a notification. */
  queue(partnerId: string): Promise<void>;
}

/**
 * Someone asks me for a call right now. Requests from people my settings do not accept
 * are dropped without a notification; the server will refuse them up front instead.
 */
export function receiveRequest(partnerId: string): boolean {
  const app = useApp.getState();
  if (!acceptsRequestFrom(app.settings, app, partnerId)) return false;
  app.notify({ type: 'incoming', partnerId, expiresAt: Date.now() + ONLINE_REQUEST_SECONDS * 1000 });
  return true;
}

/** Development stand-in: online people accept after a moment; offline people accept a few seconds later. */
export const mockRequests: RequestService = {
  askNow(_partnerId, signal) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve('accepted'), 2500);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('aborted'));
      });
    });
  },
  async queue(partnerId) {
    setTimeout(() => {
      const app = useApp.getState();
      if (!app.requests.some((r) => r.partnerId === partnerId)) return; // cancelled or blocked meanwhile
      app.removeRequest(partnerId);
      app.notify({ type: 'accepted', partnerId, expiresAt: Date.now() + ACCEPTED_CALLABLE_HOURS * 3600 * 1000 });
    }, 6000);
  },
};

export const requests: RequestService = mockRequests;

// ── Real requests between signed-in users (through the server) ──────────────

export interface LiveRequest {
  id: string;
  from: string;
  to: string;
  kind: 'now' | 'later';
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  expiresAt: number;
  answeredAt: number | null;
  callId: string | null;
}

/** Why a request could not be sent, as reported by the server. */
export type SendError = 'not-accepting' | 'busy' | 'no-shared-language' | 'not-found' | 'suspended' | 'network';

export async function sendRequest(to: string): Promise<{ id: string; kind: 'now' | 'later' }> {
  try {
    return await api<{ id: string; kind: 'now' | 'later' }>('/api/request', { to });
  } catch (e) {
    const known: SendError[] = ['not-accepting', 'busy', 'no-shared-language', 'not-found', 'suspended'];
    const msg = (e as Error).message as SendError;
    throw Object.assign(new Error(msg), { reason: known.includes(msg) ? msg : 'network' });
  }
}

export function answerRequest(id: string, accept: boolean): Promise<{ callId: string | null }> {
  return api('/api/request', { id, accept }, 'PUT');
}

export function cancelRequest(id: string): Promise<unknown> {
  return api('/api/request', { id }, 'DELETE').catch(() => null);
}

/** Follows one request (the sender waiting for an answer). Returns the unsubscribe function. */
export function watchRequest(id: string, onChange: (r: LiveRequest) => void): () => void {
  return onSnapshot(doc(db, 'requests', id), (snap) => {
    if (snap.exists()) onChange({ id, ...(snap.data() as Omit<LiveRequest, 'id'>) });
  }, () => {});
}

/**
 * While signed in: incoming pending requests and accepted "later" requests become
 * notifications (each once). Push notifications will cover the app being closed.
 */
export function startRequestListeners(uid: string): () => void {
  const seen = (requestId: string, type: 'incoming' | 'accepted') =>
    useApp.getState().notifications.some((n) => n.requestId === requestId && n.type === type);
  const requestsRef = collection(db, 'requests');

  const stopIn = onSnapshot(query(requestsRef, where('to', '==', uid), where('status', '==', 'pending')), (snap) => {
    for (const d of snap.docs) {
      const r = d.data() as Omit<LiveRequest, 'id'>;
      if (r.expiresAt < Date.now() || seen(d.id, 'incoming')) continue;
      useApp.getState().notify({ type: 'incoming', partnerId: r.from, requestId: d.id, expiresAt: r.expiresAt });
    }
  }, () => {});

  const stopOut = onSnapshot(query(requestsRef, where('from', '==', uid), where('status', '==', 'accepted'), where('kind', '==', 'later')), (snap) => {
    for (const d of snap.docs) {
      const r = d.data() as Omit<LiveRequest, 'id'>;
      const until = (r.answeredAt ?? 0) + ACCEPTED_CALLABLE_HOURS * 3600 * 1000;
      if (until < Date.now() || seen(d.id, 'accepted')) continue;
      useApp.getState().removeRequest(r.to);
      useApp.getState().notify({ type: 'accepted', partnerId: r.to, requestId: d.id, expiresAt: until });
    }
  }, () => {});

  return () => { stopIn(); stopOut(); };
}
