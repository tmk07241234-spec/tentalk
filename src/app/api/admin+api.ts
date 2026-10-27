import { handle, isAdmin, requireAdmin } from '@/server/auth';
import { actOnReport, listReports } from '@/server/moderation';

/** ?check=1: whether the caller is an operator. Otherwise: the open reports (operators only). */
export async function GET(request: Request) {
  return handle(async () => {
    if (new URL(request.url).searchParams.get('check')) {
      const { admin, needsVerification } = await isAdmin(request);
      return { admin, needsVerification };
    }
    await requireAdmin(request);
    return listReports();
  });
}

/** An operator's decision on a report: { id, action }. */
export async function POST(request: Request) {
  return handle(async () => {
    const adminUid = await requireAdmin(request);
    const b = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    return actOnReport(adminUid, b.id, b.action);
  });
}
