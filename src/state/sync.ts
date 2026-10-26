import { isUploaded } from '@/domain/profile';
import { cloud } from '@/services/cloud';
import { media } from '@/services/media';
import { toCloud } from './cloudShape';
import { useApp } from './store';

const DELAY_MS = 1500;
const RETRY_MS = 30_000;

const isMissingFile = (e: unknown) => (e as { code?: string }).code === 'media/missing-file';

/**
 * Saves the signed-in account to Firestore shortly after it changes. New photos and
 * voice intros are uploaded first and swapped for their URLs; removed ones are deleted.
 * Each half of the account is written only when it differs from the last save.
 * Returns the unsubscribe function.
 */
export function startCloudSync(): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let running = false;
  let last = { uid: '', profile: '', state: '' };
  // Files known to be in Storage, so removing one from the profile deletes it there.
  let uploaded = { photo: false, voice: false };

  /** Uploads new files. Returns false when the profile changed meanwhile and the flush should start over. */
  const syncMedia = async (uid: string): Promise<boolean> => {
    const p = useApp.getState().profile;
    if (!p) return true;
    if (p.photoUri && !isUploaded(p.photoUri)) {
      const local = p.photoUri;
      const url = await media.upload(uid, 'photo', local).catch((e) => {
        if (!isMissingFile(e)) throw e;
        return null;
      });
      if (url) uploaded.photo = true;
      if (useApp.getState().profile?.photoUri !== local) return false;
      useApp.getState().updateProfile({ photoUri: url });
      if (!url) return false;
    } else if (!p.photoUri && uploaded.photo) {
      await media.remove(uid, 'photo');
      uploaded.photo = false;
    }
    const v = useApp.getState().profile?.voice;
    if (v && !isUploaded(v.uri)) {
      const url = await media.upload(uid, 'voice', v.uri).catch((e) => {
        if (!isMissingFile(e)) throw e;
        return null;
      });
      if (url) uploaded.voice = true;
      if (useApp.getState().profile?.voice?.uri !== v.uri) return false;
      useApp.getState().updateProfile({ voice: url ? { ...v, uri: url } : null });
      if (!url) return false;
    } else if (!v && uploaded.voice) {
      await media.remove(uid, 'voice');
      uploaded.voice = false;
    }
    return true;
  };

  const flush = async () => {
    timer = null;
    if (running) return schedule();
    const uid = useApp.getState().account?.uid;
    if (!uid || !useApp.getState().profile) return;
    running = true;
    try {
      if (uid !== last.uid) {
        const p = useApp.getState().profile;
        last = { uid, profile: '', state: '' };
        uploaded = { photo: !!p?.photoUri && isUploaded(p.photoUri), voice: !!p?.voice && isUploaded(p.voice.uri) };
      }
      if (!(await syncMedia(uid))) return schedule();
      const data = toCloud(useApp.getState());
      if (!data || useApp.getState().account?.uid !== uid) return;
      const profile = JSON.stringify(data.profile);
      const state = JSON.stringify(data.state);
      const parts = { profile: profile !== last.profile, state: state !== last.state };
      if (!parts.profile && !parts.state) return;
      await cloud.save(uid, data, parts);
      last = { uid, profile, state };
    } catch {
      // Offline or rejected: try again later, or sooner if something changes.
      if (!timer) timer = setTimeout(flush, RETRY_MS);
    } finally {
      running = false;
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
