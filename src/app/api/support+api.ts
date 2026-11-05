import { caller, handle } from '@/server/auth';
import { saveInquiry } from '@/server/support';

/** A message from the in-app contact form: { kind, message, replyTo }. */
export async function POST(request: Request) {
  return handle(async () => {
    const c = await caller(request);
    return saveInquiry(c.uid, c.email, await request.json().catch(() => null));
  });
}
