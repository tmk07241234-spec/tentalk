import { handle, requireUser } from '@/server/auth';
import { setFollow } from '@/server/follows';

/** Follow or unfollow someone you finished a 10-minute call with: { to, on }. */
export async function POST(request: Request) {
  return handle(async () => {
    const b = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    return setFollow(await requireUser(request), b.to, b.on);
  });
}
