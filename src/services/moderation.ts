import { doc, onSnapshot } from 'firebase/firestore';

import type { ModerationRecord } from '@/domain/moderation';
import { useApp } from '@/state/store';
import { db } from './firebase/db';

/** While signed in: applies report decisions about me (trust, notices, suspension) as they arrive. */
export function startModerationListener(uid: string): () => void {
  return onSnapshot(doc(db, 'users', uid, 'private', 'moderation'), (snap) => {
    if (snap.exists()) useApp.getState().applyModeration(snap.data() as ModerationRecord);
  }, () => {});
}
