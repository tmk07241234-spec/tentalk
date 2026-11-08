import { handle, isAdmin, requireAdmin } from '@/server/auth';
import { actOnReport, listReports } from '@/server/moderation';
import { purgeExpired } from '@/server/retention';
import { closeInquiry, listInquiries } from '@/server/support';

/** ?check=1: whether the caller is an operator. Otherwise: the open reports (operators only). */
export async function GET(request: Request) {
  return handle(async () => {
    if (new URL(request.url).searchParams.get('check')) {
      const { admin, needsVerification } = await isAdmin(request);
      return { admin, needsVerification };
    }
    await requireAdmin(request);
    if (new URL(request.url).searchParams.get('inquiries')) return listInquiries();
    return listReports();
  });
}

/**
 * An operator's decision on a report: { id, action }; closing an inquiry: { inquiry };
 * or { purge: true } to delete records past their retention period (domain/retention).
 */
export async function POST(request: Request) {
  return handle(async () => {
    const adminUid = await requireAdmin(request);
    const b = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    if (b.purge === true) return purgeExpired();
    if (b.inquiry !== undefined) return closeInquiry(adminUid, b.inquiry);
    return actOnReport(adminUid, b.id, b.action);
  });
}
