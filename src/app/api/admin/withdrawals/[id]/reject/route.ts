import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { createTransaction } from '@/lib/wallet';
import { createAuditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_withdrawal_reject', 20, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id } = await params;
    const { rejectionReason } = await request.json();

    if (!rejectionReason) {
      return badRequest('rejectionReason is required');
    }

    const withdrawalRef = adminDb.collection('withdrawals').doc(id);
    
    const doc = await withdrawalRef.get();
    if (!doc.exists || !doc.data()) return badRequest('Withdrawal not found');
    const data = doc.data()!;

    const validStatuses = ['pending', 'processing', 'approved'];
    if (!validStatuses.includes(data?.status)) {
      return badRequest(`Withdrawal cannot be rejected because it is already '${data?.status || 'processed'}'`);
    }

    await withdrawalRef.update({
      status: 'rejected',
      rejectionReason,
      processedAt: new Date(),
      processedBy: admin.id
    });

    // Restore balance
    await createTransaction({
      userId: data.userId,
      amount: data.amount,
      type: 'withdrawal_reversal',
      source: 'admin',
      referenceId: id,
      description: `Withdrawal rejected: ${rejectionReason}`,
      metadata: { withdrawalId: id }
    });

    await createAuditLog({
      performedBy: admin.id,
      action: 'reject_withdrawal',
      details: { withdrawalId: id, rejectionReason, amount: data.amount }
    });

    // Invalidate caches so telemetry and lists refresh immediately
    const { invalidateCache } = await import('@/lib/cache');
    invalidateCache('admin_withdrawals');
    invalidateCache('admin_dashboard');

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
