import { NextResponse } from 'next/server';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { createTransaction } from '@/lib/wallet';
import { createAuditLog } from '@/lib/audit';
import { balanceAdjustmentSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_adjust_balance', 20, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const validatedData = balanceAdjustmentSchema.safeParse(body);
    if (!validatedData.success) {
      return badRequest(validatedData.error.issues.map((e: { message: string }) => e.message).join(', '));
    }

    const { amount, reason } = validatedData.data;

    await createTransaction({
      userId: id,
      amount,
      type: 'admin_adjustment',
      source: 'admin',
      description: reason,
      metadata: { adminId: admin.id }
    });

    await createAuditLog({
      performedBy: admin.id,
      action: 'balance_adjustment',
      details: { userId: id, amount, reason }
    });

    const { invalidateCache } = await import('@/lib/cache');
    invalidateCache(`admin_user:${id}`);
    invalidateCache('admin_users');
    invalidateCache('admin_dashboard');

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
