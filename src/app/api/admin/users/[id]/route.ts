import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_user_get', 60, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id } = await params;
    const userDoc = await adminDb.collection('users').doc(id).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const [transactions, referrals] = await Promise.all([
      adminDb.collection('transactions').where('userId', '==', id).orderBy('createdAt', 'desc').limit(10).get(),
      adminDb.collection('users').where('referredBy', '==', id).limit(10).get()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        user: { id: userDoc.id, ...userDoc.data() },
        transactions: transactions.docs.map(d => ({ id: d.id, ...d.data() })),
        referrals: referrals.docs.map(d => ({ id: d.id, ...d.data() }))
      }
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_user_patch', 30, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, duration = 'permanent', customHours, reason } = body;

    if (!['active', 'suspended'].includes(status)) {
      return badRequest('Invalid status');
    }

    let suspendedUntil: string | null = null;
    if (status === 'suspended') {
      const now = Date.now();
      if (duration === '1h') {
        suspendedUntil = new Date(now + 1 * 3600_000).toISOString();
      } else if (duration === '24h' || duration === '1d') {
        suspendedUntil = new Date(now + 24 * 3600_000).toISOString();
      } else if (duration === '3d') {
        suspendedUntil = new Date(now + 3 * 24 * 3600_000).toISOString();
      } else if (duration === '7d' || duration === '1w') {
        suspendedUntil = new Date(now + 7 * 24 * 3600_000).toISOString();
      } else if (duration === '30d' || duration === '1m') {
        suspendedUntil = new Date(now + 30 * 24 * 3600_000).toISOString();
      } else if (duration === 'custom' && customHours) {
        suspendedUntil = new Date(now + Number(customHours) * 3600_000).toISOString();
      } else {
        // 'permanent'
        suspendedUntil = null;
      }
    }

    const userRef = adminDb.collection('users').doc(id);
    await userRef.update({
      status,
      suspendedUntil: status === 'suspended' ? suspendedUntil : null,
      suspendReason: status === 'suspended' ? (reason?.trim() || null) : null,
      suspendedAt: status === 'suspended' ? new Date() : null,
      updatedAt: new Date(),
    });

    await createAuditLog({
      performedBy: admin.id,
      action: `update_user_status`,
      details: { 
        userId: id, 
        newStatus: status, 
        duration: status === 'suspended' ? duration : undefined,
        suspendedUntil,
        reason,
      }
    });

    return NextResponse.json({ success: true, suspendedUntil, status });
  } catch (error) {
    return serverError(error);
  }
}
