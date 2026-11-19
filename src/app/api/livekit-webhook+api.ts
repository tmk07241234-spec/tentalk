import { handle } from '@/server/auth';
import { onCallEvent, verifyWebhook } from '@/server/practice';

/** The call service (LiveKit) reports joins and leaves here; see server/practice. */
export async function POST(request: Request) {
  return handle(async () => {
    const body = await request.text();
    const ev = await verifyWebhook(body, request.headers.get('authorization'));
    return onCallEvent(ev);
  });
}
