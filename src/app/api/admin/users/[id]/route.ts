import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';
import { getCached, setCached } from '@/lib/cache';

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

    const cacheKey = `admin_user:${cleanId}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached, cached: true });
    }

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

    // Safe transactions fetch
    let transactions: any[] = [];
    try {
      const txSnap = await adminDb.collection('transactions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(25)
        .get();
      transactions = txSnap.docs.map(d => ({ id: d.id, ...formatFirestoreData(d.data()) }));
    } catch {
      try {
        const txSnap = await adminDb.collection('transactions')
          .where('userId', '==', userId)
          .limit(25)
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
      const refSnap = await adminDb.collection('users').where('referredBy', '==', userId).limit(25).get();
      referrals = refSnap.docs.map(d => ({ id: d.id, ...formatFirestoreData(d.data()) }));
    } catch (err) {
      console.warn('Failed to load referrals for user', userId, err);
    }

    // Safe withdrawals fetch
    let withdrawals: any[] = [];
    try {
      const wdSnap = await adminDb.collection('withdrawals').where('userId', '==', userId).limit(25).get();
      withdrawals = wdSnap.docs.map(d => ({ id: d.id, ...formatFirestoreData(d.data()) }));
      withdrawals.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } catch (err) {
      console.warn('Failed to load withdrawals for user', userId, err);
    }

    const coinsBalance = rawUserData.coins !== undefined ? Number(rawUserData.coins) : Number(rawUserData.pointsBalance || rawUserData.balance || 0);
    const lifetimeEarned = Math.max(coinsBalance, Number(rawUserData.totalEarned || 0), Number(rawUserData.lifetimeEarned || 0));

    const formattedUser = {
      id: userId,
      ...formatFirestoreData(rawUserData),
      telegramId: rawUserData.telegramId || userId,
      pointsBalance: coinsBalance,
      balance: coinsBalance,
      coins: coinsBalance,
      level: Number(rawUserData.level || 1),
      profitPerHour: Number(rawUserData.profitPerHour || 0),
      energy: Number(rawUserData.energy || 1000),
      maxEnergy: Number(rawUserData.maxEnergy || 1000),
      lifetimeEarned,
      lifetimeWithdrawn: Number(rawUserData.lifetimeWithdrawn || 0),
      miningCards: rawUserData.miningCards || rawUserData.cards || {},
      payoutMethod: rawUserData.payoutMethod || rawUserData.defaultPayoutMethod || null,
      walletAddress: rawUserData.walletAddress || null,
      savedUpiId: rawUserData.savedUpiId || null,
      savedBankDetails: rawUserData.savedBankDetails || null,
      isBanned: Boolean(rawUserData.isBanned || rawUserData.status === 'suspended'),
      status: rawUserData.isBanned ? 'suspended' : (rawUserData.status || 'active'),
      checkinStreak: Number(rawUserData.checkinStreak || 0),
      lastCheckinDate: rawUserData.lastCheckinDate || null,
      spinStats: rawUserData.spinStats || null,
      comboStats: rawUserData.comboStats || null,
      cipherStats: rawUserData.cipherStats || null,
      fraudScore: Number(rawUserData.fraudScore || 0),
      fraudReason: rawUserData.fraudReason || null,
    };

    const responseData = {
      user: formattedUser,
      transactions,
      referrals,
      withdrawals,
    };

    setCached(cacheKey, responseData, 15);

    return NextResponse.json({
      success: true,
      data: responseData,
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

    const isBanning = status === 'suspended';
    let suspendedUntil: string | null = null;

    if (isBanning) {
      if (duration === '24h') {
        suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (duration === '48h') {
        suspendedUntil = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      } else if (duration === '7d') {
        suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (duration === '30d') {
        suspendedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (duration === 'custom' && customHours) {
        const hrs = parseInt(customHours);
        if (!isNaN(hrs) && hrs > 0) {
          suspendedUntil = new Date(Date.now() + hrs * 60 * 60 * 1000).toISOString();
        }
      }
    }

    const updatePayload: Record<string, any> = {
      status,
      isBanned: isBanning,
      suspendedUntil: isBanning ? suspendedUntil : null,
      suspendReason: isBanning ? (reason || 'Suspended by admin') : null,
      fraudReason: isBanning ? (reason || 'Suspended by admin') : null,
      updatedAt: new Date(),
    };

    await userRef.update(updatePayload);

    await createAuditLog({
      performedBy: admin.id,
      action: isBanning ? 'BAN_USER' : 'UNBAN_USER',
      targetId: userRef.id,
      targetType: 'user',
      details: { status, duration, reason, suspendedUntil },
    });

    const { invalidateCache } = await import('@/lib/cache');
    invalidateCache(`admin_user:${cleanId}`);
    invalidateCache(`admin_user:${userRef.id}`);
    invalidateCache('admin_users');
    invalidateCache('admin_dashboard');

    return NextResponse.json({
      success: true,
      data: { id: userRef.id, status, isBanned: isBanning, suspendedUntil },
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return serverError(error);
  }
}
