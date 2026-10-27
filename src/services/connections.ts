import { doc, onSnapshot } from 'firebase/firestore';

import { findSamplePartner } from '@/services/matchmaking';
import { useApp } from '@/state/store';
import { api } from './api';
import { db } from './firebase/db';

/**
 * Follow boundary. Following is saved with my account; for real users the server also
 * adds me to their followers list (after checking we finished a 10-minute call).
 */
export interface ConnectionService {
  /** After a finished 10-minute call the partner may follow back. */
  afterCompletedCall(partnerId: string): void;
  follow(id: string): void;
  unfollow(id: string): void;
}

const isReal = (id: string) => !!useApp.getState().account?.uid && !findSamplePartner(id);

export const connections: ConnectionService = {
  // Sample people (10+ calls) follow back a few seconds later; real people decide themselves.
  afterCompletedCall(partnerId) {
    if ((findSamplePartner(partnerId)?.calls ?? 0) < 10) return;
    setTimeout(() => {
      const app = useApp.getState();
      if (app.followers.includes(partnerId) || app.blocked.includes(partnerId)) return;
      app.addFollower(partnerId);
      app.notify({ type: 'followed', partnerId });
    }, 5000);
  },
  follow(id) {
    const before = useApp.getState().following.length;
    useApp.getState().follow(id);
    if (useApp.getState().following.length === before || !isReal(id)) return;
    // The call that allows this may still be on its way to the server (saved a moment
    // after the call ends), so a refusal is retried once before the follow is rolled back.
    const send = () => api('/api/follow', { to: id, on: true });
    send()
      .catch(() => new Promise((ok) => setTimeout(ok, 4000)).then(send))
      .catch(() => useApp.getState().unfollow(id));
  },
  unfollow(id) {
    useApp.getState().unfollow(id);
    if (isReal(id)) void api('/api/follow', { to: id, on: false }).catch(() => {});
  },
};

/**
 * While signed in: keeps my followers in step with the server and announces new ones.
 * Sample followers (from the stand-in above) are kept alongside.
 */
export function startFollowersListener(uid: string): () => void {
  return onSnapshot(doc(db, 'users', uid, 'private', 'followers'), (snap) => {
    const ids = snap.exists() && Array.isArray(snap.data().ids) ? (snap.data().ids as string[]) : [];
    const app = useApp.getState();
    for (const id of ids) if (!app.followers.includes(id) && !app.blocked.includes(id)) app.notify({ type: 'followed', partnerId: id });
    app.setFollowers([...app.followers.filter((id) => findSamplePartner(id)), ...ids]);
  }, () => {});
}
