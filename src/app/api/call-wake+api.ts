import { handle, requireUser } from '@/server/auth';
import { parseMatchRequest } from '@/server/calls';
import { wakePartners } from '@/server/wake';

/** At the start of a quick-match search with nobody waiting: let a few possible partners know (domain/wake). */
export async function POST(request: Request) {
  return handle(async () => wakePartners(await requireUser(request), parseMatchRequest(await request.json().catch(() => null))));
}
