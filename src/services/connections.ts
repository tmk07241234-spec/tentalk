import { findSamplePartner } from '@/services/matchmaking';
import { useApp } from '@/state/store';

/**
 * Follow boundary. Following someone is saved with the account; being followed is
 * something the server will tell us. The real version sends a "followed" push.
 */
export interface ConnectionService {
  /** After a finished 10-minute call the partner may follow back. */
  afterCompletedCall(partnerId: string): void;
}

/** Development stand-in: experienced sample partners (10+ calls) follow you a few seconds later. */
export const mockConnections: ConnectionService = {
  afterCompletedCall(partnerId) {
    if ((findSamplePartner(partnerId)?.calls ?? 0) < 10) return;
    setTimeout(() => {
      const app = useApp.getState();
      if (app.followers.includes(partnerId) || app.blocked.includes(partnerId)) return;
      app.addFollower(partnerId);
      app.notify({ type: 'followed', partnerId });
    }, 5000);
  },
};

export const connections: ConnectionService = mockConnections;
