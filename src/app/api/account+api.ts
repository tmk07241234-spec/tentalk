import { handle, requireUser } from '@/server/auth';
import { firestore } from '@/server/firestore';

/**
 * Removes the server-kept parts of an account (followers list, waiting entry) before the
 * account itself is deleted. The moderation record and reports are kept for safety
 * reviews, as the privacy policy says.
 */
export async function DELETE(request: Request) {
  return handle(async () => {
    const uid = await requireUser(request);
    await firestore.commit([{ delete: `users/${uid}/private/followers` }, { delete: `queue/${uid}` }]);
    return { ok: true };
  });
}
