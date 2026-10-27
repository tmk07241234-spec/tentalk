import { handle, requireUser } from '@/server/auth';
import { answerRequest, cancelRequest, sendRequest } from '@/server/requests';

const body = async (request: Request) => ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;

/** Send a 10-minute call request: { to }. */
export async function POST(request: Request) {
  return handle(async () => sendRequest(await requireUser(request), (await body(request)).to));
}

/** Answer a request you received: { id, accept }. */
export async function PUT(request: Request) {
  return handle(async () => {
    const b = await body(request);
    return answerRequest(await requireUser(request), b.id, b.accept);
  });
}

/** Cancel a request you sent: { id }. */
export async function DELETE(request: Request) {
  return handle(async () => cancelRequest(await requireUser(request), (await body(request)).id));
}
