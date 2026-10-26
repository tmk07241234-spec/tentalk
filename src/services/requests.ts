import { acceptsRequestFrom } from '@/domain/connections';
import { ACCEPTED_CALLABLE_HOURS, ONLINE_REQUEST_SECONDS } from '@/domain/schedule';
import { useApp } from '@/state/store';

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
