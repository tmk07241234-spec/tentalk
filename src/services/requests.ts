import { ACCEPTED_CALLABLE_HOURS } from '@/domain/schedule';
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
