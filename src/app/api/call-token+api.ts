import { handle, HttpError, requireUser } from '@/server/auth';
import { bothAgreed } from '@/domain/consent';
import { callFor } from '@/server/calls';
import { firestore } from '@/server/firestore';
import { roomToken } from '@/server/livekit';

/** Entry to a matched call's audio room, for one of its two members. */
export async function POST(request: Request) {
  return handle(async () => {
    const uid = await requireUser(request);
    const { callId } = ((await request.json().catch(() => null)) ?? {}) as { callId?: unknown };
    if (typeof callId !== 'string') throw new HttpError(400, 'Invalid call.');
    const call = await callFor(uid, callId);
    // A quick match opens only after both people saw each other and chose to talk.
    if (!bothAgreed(call)) throw new HttpError(403, 'not-agreed');
    const me = await firestore.get(`users/${uid}`);
    const access = await roomToken({ room: callId, identity: uid, name: typeof me?.name === 'string' ? me.name : '' });
    return { ...access, partnerId: call.members.find((m) => m !== uid), mode: call.mode, kind: call.kind };
  });
}
