import { handle, HttpError, requireUser } from '@/server/auth';
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
    const me = await firestore.get(`users/${uid}`);
    const access = await roomToken({ room: callId, identity: uid, name: typeof me?.name === 'string' ? me.name : '' });
    return { ...access, partnerId: call.members.find((m) => m !== uid), mode: call.mode, startLang: call.startLang, kind: call.kind };
  });
}
