import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';

import { withDefaults, type PracticeStats } from '@/domain/practice';
import { db } from './firebase/db';

/**
 * Someone's practice record and trust, kept by the server in stats/{uid} (see
 * domain/practice). Null while loading, for sample people, or without an id.
 */
export function useStats(uid: string | undefined | null): PracticeStats | null {
  const [loaded, setLoaded] = useState<{ uid: string; stats: PracticeStats } | null>(null);
  const valid = !!uid && /^[A-Za-z0-9]{10,40}$/.test(uid);
  useEffect(() => {
    if (!valid) return;
    return onSnapshot(doc(db, 'stats', uid), (snap) => setLoaded({ uid, stats: withDefaults(snap.exists() ? (snap.data() as Partial<PracticeStats>) : null) }), () => {});
  }, [uid, valid]);
  return valid && loaded?.uid === uid ? loaded.stats : null;
}
