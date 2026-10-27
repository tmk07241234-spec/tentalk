import { handle, HttpError, requireUser } from '@/server/auth';
import { saveReport } from '@/server/calls';

/** A report sent from a call, kept for review. */
export async function POST(request: Request) {
  return handle(async () => {
    const uid = await requireUser(request);
    const { callId, reason } = ((await request.json().catch(() => null)) ?? {}) as { callId?: unknown; reason?: unknown };
    if (typeof callId !== 'string' || typeof reason !== 'string') throw new HttpError(400, 'Invalid report.');
    await saveReport(uid, callId, reason);
    return { ok: true };
  });
}
