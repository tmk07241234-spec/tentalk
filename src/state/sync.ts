import { cloud } from '@/services/cloud';
import { toCloud } from './cloudShape';
import { useApp } from './store';

const DELAY_MS = 1500;

/**
 * Saves the signed-in account to Firestore shortly after it changes. Each half is
 * written only when its contents differ from the last successful save.
 * Returns the unsubscribe function.
 */
export function startCloudSync(): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let last = { uid: '', profile: '', state: '' };

  const flush = async () => {
    timer = null;
    const s = useApp.getState();
    const uid = s.account?.uid;
    const data = toCloud(s);
    if (!uid || !data) return;
    if (uid !== last.uid) last = { uid, profile: '', state: '' };
    const profile = JSON.stringify(data.profile);
    const state = JSON.stringify(data.state);
    const parts = { profile: profile !== last.profile, state: state !== last.state };
    if (!parts.profile && !parts.state) return;
    try {
      await cloud.save(uid, data, parts);
      last = { uid, profile, state };
    } catch {
      // Offline or rejected: the next change tries again with everything that differs.
    }
  };

  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, DELAY_MS);
  };

  schedule();
  const unsubscribe = useApp.subscribe(schedule);
  return () => {
    unsubscribe();
    if (timer) clearTimeout(timer);
  };
}
