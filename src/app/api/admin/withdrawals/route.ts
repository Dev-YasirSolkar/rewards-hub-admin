import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { getCached, setCached, getCachedUserProfile, setCachedUserProfile } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_withdrawals', 60, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const forceRefresh = searchParams.get('refresh') === 'true';

    const cacheKey = `admin_withdrawals:${status}:${limit}`;
    if (!forceRefresh) {
      const cached = getCached<any>(cacheKey);
      if (cached) {
        return NextResponse.json({ success: true, data: cached, withdrawals: cached, cached: true });
      }
    }

    let snapshot;
    const isFiltered = status && status !== 'all';

    try {
      if (isFiltered) {
        snapshot = await adminDb
          .collection('withdrawals')
          .where('status', '==', status)
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get();
      } else {
        snapshot = await adminDb
          .collection('withdrawals')
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get();
      }
    } catch (indexErr) {
      console.warn('Withdrawals index query fallback:', indexErr);
      if (isFiltered) {
        snapshot = await adminDb
          .collection('withdrawals')
          .where('status', '==', status)
          .limit(limit)
          .get();
      } else {
        snapshot = await adminDb
          .collection('withdrawals')
          .limit(limit)
          .get();
      }
    }

    const rawDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Extract unique user IDs
    const userIds = Array.from(new Set(rawDocs.map((w: any) => w.userId).filter(Boolean)));
    const userMap = new Map<string, { firstName?: string; username?: string; telegramId?: number }>();
    const uncachedIds: string[] = [];

    // Check in-memory user cache first (0 Firestore reads for already-known users)
    for (const uId of userIds) {
      const cachedProfile = getCachedUserProfile(uId);
      if (cachedProfile) {
        userMap.set(uId, cachedProfile);
      } else {
        uncachedIds.push(uId);
      }
    }

    // Batch fetch only uncached user documents using getAll (cuts reads dramatically)
    if (uncachedIds.length > 0) {
      try {
        const refs = uncachedIds.map((uId) => adminDb.collection('users').doc(uId));
        const userDocs = await adminDb.getAll(...refs);
        for (const uDoc of userDocs) {
          if (uDoc.exists) {
            const uData = uDoc.data();
            const profile = {
              firstName: uData?.firstName,
              username: uData?.username,
              telegramId: uData?.telegramId,
            };
            userMap.set(uDoc.id, profile);
            setCachedUserProfile(uDoc.id, profile, 600); // Cache profile for 10 minutes
          }
        }
      } catch (batchErr) {
        console.warn('Batch user profile lookup fallback:', batchErr);
      }
    }

    const withdrawals = rawDocs.map((w: any) => {
      const uInfo = userMap.get(w.userId);
      let isoDate: string;
      if (w.createdAt?.toDate) {
        isoDate = w.createdAt.toDate().toISOString();
      } else if (typeof w.createdAt === 'string') {
        isoDate = w.createdAt;
      } else if (w.createdAt?._seconds) {
        isoDate = new Date(w.createdAt._seconds * 1000).toISOString();
      } else {
        isoDate = new Date().toISOString();
      }

      return {
        ...w,
        userName: uInfo?.firstName || 'User',
        userUsername: uInfo?.username || null,
        userTelegramId: uInfo?.telegramId || null,
        createdAt: isoDate,
      };
    });

    // In-memory sort by createdAt descending
    withdrawals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Cache the processed withdrawals list for 30 seconds
    setCached(cacheKey, withdrawals, 30);

    return NextResponse.json({ success: true, data: withdrawals, withdrawals, cached: false });
  } catch (error) {
    return serverError(error);
  }
}
