import { handle, HttpError, requireUser } from '@/server/auth';
import { consentStep } from '@/server/calls';

/** Quick match, before the call: { callId, accept?: boolean } → { partnerId, mode, status }. */
export async function POST(request: Request) {
  return handle(async () => {
    const uid = await requireUser(request);
    const { callId, accept } = ((await request.json().catch(() => null)) ?? {}) as { callId?: unknown; accept?: unknown };
    if (typeof callId !== 'string') throw new HttpError(400, 'Invalid call.');
    return consentStep(uid, callId, accept);
  });
}
