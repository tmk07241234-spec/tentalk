import { deleteDoc, doc, getDoc, writeBatch } from 'firebase/firestore';

import type { CloudAccount } from '@/state/cloudShape';
import { db } from './firebase/db';

const profileRef = (uid: string) => doc(db, 'users', uid);
const stateRef = (uid: string) => doc(db, 'users', uid, 'private', 'state');

/** Reads and writes the signed-in user's own data in Firestore. */
export const cloud = {
  /** The saved account, or null for someone who has not finished setup yet. */
  async load(uid: string): Promise<CloudAccount | null> {
    const [p, s] = await Promise.all([getDoc(profileRef(uid)), getDoc(stateRef(uid))]);
    if (!p.exists() || !s.exists()) return null;
    return { profile: p.data() as CloudAccount['profile'], state: s.data() as CloudAccount['state'] };
  },

  async save(uid: string, data: CloudAccount, parts: { profile: boolean; state: boolean }): Promise<void> {
    const batch = writeBatch(db);
    if (parts.profile) batch.set(profileRef(uid), data.profile);
    if (parts.state) batch.set(stateRef(uid), data.state);
    await batch.commit();
  },

  /** Removes everything stored for the account. Runs before the sign-in account is deleted. */
  async remove(uid: string): Promise<void> {
    await deleteDoc(stateRef(uid));
    await deleteDoc(profileRef(uid));
  },
};
