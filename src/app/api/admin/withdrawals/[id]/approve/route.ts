import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_withdrawal_approve', 20, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id } = await params;
    const withdrawalRef = adminDb.collection('withdrawals').doc(id);
    
    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(withdrawalRef);
      if (!doc.exists) {
        throw new Error('Withdrawal not found');
      }
      
      const data = doc.data();
      if (data?.status !== 'pending') {
        throw new Error('Withdrawal is not pending');
      }

      transaction.update(withdrawalRef, {
        status: 'approved',
        processedAt: new Date(),
        processedBy: admin.id
      });
    });

    await createAuditLog({
      performedBy: admin.id,
      action: 'approve_withdrawal',
      details: { withdrawalId: id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Withdrawal not found' || error.message === 'Withdrawal is not pending') {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}
