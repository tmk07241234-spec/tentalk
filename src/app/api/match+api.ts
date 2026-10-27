import { handle, requireUser } from '@/server/auth';
import { cancelSearch, parseMatchRequest, searchStep } from '@/server/calls';

/** One step of a random-call search (repeat every few seconds while searching). */
export async function POST(request: Request) {
  return handle(async () => searchStep(await requireUser(request), parseMatchRequest(await request.json().catch(() => null))));
}

/** Stop searching. */
export async function DELETE(request: Request) {
  return handle(async () => cancelSearch(await requireUser(request)));
}
