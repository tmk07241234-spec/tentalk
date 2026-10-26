import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from './firebase/storage';

/** Profile files live at users/{uid}/photo and users/{uid}/voice; a new upload replaces the old one. */
export type MediaKind = 'photo' | 'voice';

const fileRef = (uid: string, kind: MediaKind) => ref(storage, `users/${uid}/${kind}`);

// Recorders do not always label their files, so fall back on the extension.
function contentType(blob: Blob, uri: string, kind: MediaKind): string {
  if (blob.type) return blob.type;
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
  if (kind === 'photo') return ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  return ext === 'webm' ? 'audio/webm' : ext === 'caf' ? 'audio/x-caf' : ext === '3gp' ? 'audio/3gpp' : 'audio/mp4';
}

export const media = {
  /** Uploads a local file (file://, blob: or data: URI) and returns its download URL. */
  async upload(uid: string, kind: MediaKind, localUri: string): Promise<string> {
    // A web recording's blob: URL dies with the page; report that apart from upload errors.
    const blob = await fetch(localUri)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .catch(() => Promise.reject(Object.assign(new Error('The local file is gone.'), { code: 'media/missing-file' })));
    const r = fileRef(uid, kind);
    await uploadBytes(r, blob, { contentType: contentType(blob, localUri, kind) });
    return getDownloadURL(r);
  },

  async remove(uid: string, kind: MediaKind): Promise<void> {
    try {
      await deleteObject(fileRef(uid, kind));
    } catch (e) {
      if ((e as { code?: string }).code !== 'storage/object-not-found') throw e;
    }
  },

  async removeAll(uid: string): Promise<void> {
    await Promise.all([media.remove(uid, 'photo'), media.remove(uid, 'voice')]);
  },
};
