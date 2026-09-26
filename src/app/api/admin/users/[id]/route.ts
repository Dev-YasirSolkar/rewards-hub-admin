import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';

function formatFirestoreData(data: Record<string, any>) {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && typeof value.toDate === 'function') {
      result[key] = value.toDate().toISOString();
    } else {
      result[key] = value;
    }
  }
  return result;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_user_get', 60, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();

    // 1. Try finding user by Document ID
    let userDoc = await adminDb.collection('users').doc(cleanId).get();

    // 2. Fallback: try finding by telegramId as number
    if (!userDoc.exists) {
      const numId = Number(cleanId);
      if (!isNaN(numId)) {
        const snap = await adminDb.collection('users').where('telegramId', '==', numId).limit(1).get();
        if (!snap.empty) {
          userDoc = snap.docs[0];
        }
      }
    }

    // 3. Fallback: try finding by telegramId as string
    if (!userDoc.exists) {
      const snap = await adminDb.collection('users').where('telegramId', '==', cleanId).limit(1).get();
      if (!snap.empty) {
        userDoc = snap.docs[0];
      }
    }

    if (!userDoc.exists) {
      return NextResponse.json({ success: false, error: `User with ID ${cleanId} not found` }, { status: 404 });
    }

    const rawUserData = userDoc.data()!;
    const userId = userDoc.id;

    // Safe transactions fetch with index-missing fallback
    let transactions: any[] = [];
    try {
      const txSnap = await adminDb.collection('transactions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();
      transactions = txSnap.docs.map(d => ({ id: d.id, ...formatFirestoreData(d.data()) }));
    } catch {
      try {
        const txSnap = await adminDb.collection('transactions')
          .where('userId', '==', userId)
          .limit(20)
          .get();
        transactions = txSnap.docs.map(d => ({ id: d.id, ...formatFirestoreData(d.data()) }));
        transactions.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      } catch (err) {
        console.warn('Failed to load transactions for user', userId, err);
      }
    }

    // Safe referrals fetch
    let referrals: any[] = [];
    try {
      const refSnap = await adminDb.collection('users').where('referredBy', '==', userId).limit(20).get();
      referrals = refSnap.docs.map(d => ({ id: d.id, ...formatFirestoreData(d.data()) }));
    } catch (err) {
      console.warn('Failed to load referrals for user', userId, err);
    }

    // Safe withdrawals fetch
    let withdrawals: any[] = [];
    try {
      const wdSnap = await adminDb.collection('withdrawals').where('userId', '==', userId).limit(20).get();
      withdrawals = wdSnap.docs.map(d => ({ id: d.id, ...formatFirestoreData(d.data()) }));
      withdrawals.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } catch (err) {
      console.warn('Failed to load withdrawals for user', userId, err);
    }

    const formattedUser = {
      id: userId,
      ...formatFirestoreData(rawUserData),
      telegramId: rawUserData.telegramId || userId,
      pointsBalance: rawUserData.pointsBalance ?? rawUserData.balance ?? 0,
      balance: rawUserData.pointsBalance ?? rawUserData.balance ?? 0,
      lifetimeEarned: rawUserData.lifetimeEarned ?? 0,
      lifetimeWithdrawn: rawUserData.lifetimeWithdrawn ?? 0,
      defaultPayoutMethod: rawUserData.defaultPayoutMethod || null,
      savedUpiId: rawUserData.savedUpiId || null,
      savedBankDetails: rawUserData.savedBankDetails || null,
    };

    return NextResponse.json({
      success: true,
      data: {
        user: formattedUser,
        transactions,
        referrals,
        withdrawals,
      }
    });
  } catch (error) {
    console.error('Error fetching admin user:', error);
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
    const cleanId = decodeURIComponent(id).trim();
    const body = await request.json();
    const { status, duration = 'permanent', customHours, reason } = body;

    if (!['active', 'suspended'].includes(status)) {
      return badRequest('Invalid status');
    }

    // Find actual doc reference
    let userRef = adminDb.collection('users').doc(cleanId);
    let userDoc = await userRef.get();

    if (!userDoc.exists) {
      const numId = Number(cleanId);
      if (!isNaN(numId)) {
        const snap = await adminDb.collection('users').where('telegramId', '==', numId).limit(1).get();
        if (!snap.empty) {
          userRef = snap.docs[0].ref;
          userDoc = snap.docs[0];
        }
      }
    }

    if (!userDoc.exists) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
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
        suspendedUntil = null;
      }
    }

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
        userId: userDoc.id, 
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
