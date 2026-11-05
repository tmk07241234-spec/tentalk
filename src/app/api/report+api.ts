import { handle, HttpError, requireUser } from '@/server/auth';
import { saveReport } from '@/server/calls';

/** A report from a call ({ callId, reason }) or about a profile ({ against, reason }), kept for review. */
export async function POST(request: Request) {
  return handle(async () => {
    const uid = await requireUser(request);
    const { callId, against, reason } = ((await request.json().catch(() => null)) ?? {}) as { callId?: unknown; against?: unknown; reason?: unknown };
    if (typeof reason !== 'string' || (typeof callId !== 'string' && typeof against !== 'string')) throw new HttpError(400, 'Invalid report.');
    await saveReport(uid, { callId: typeof callId === 'string' ? callId : undefined, against: typeof against === 'string' ? against : undefined }, reason);
    return { ok: true };
  });
}
