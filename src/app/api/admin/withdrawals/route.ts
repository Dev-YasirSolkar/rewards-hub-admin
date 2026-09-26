import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin_withdrawals:${ip}`, 60, 60_000)) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    let snapshot;
    const isFiltered = status && status !== 'all';

    try {
      if (isFiltered) {
        snapshot = await adminDb.collection('withdrawals')
          .where('status', '==', status)
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get();
      } else {
        snapshot = await adminDb.collection('withdrawals')
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get();
      }
    } catch (indexErr) {
      // Safe fallback if Firestore composite index is missing or building
      console.warn('Withdrawals index query fallback:', indexErr);
      if (isFiltered) {
        snapshot = await adminDb.collection('withdrawals')
          .where('status', '==', status)
          .limit(limit * 2)
          .get();
      } else {
        snapshot = await adminDb.collection('withdrawals')
          .limit(limit * 2)
          .get();
      }
    }

    const rawDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Enrich with user profile info for display
    const userIds = Array.from(new Set(rawDocs.map((w: any) => w.userId).filter(Boolean)));
    const userMap = new Map<string, { firstName?: string; username?: string; telegramId?: number }>();

    await Promise.all(
      userIds.map(async (uId) => {
        try {
          const uDoc = await adminDb.collection('users').doc(uId).get();
          if (uDoc.exists) {
            const uData = uDoc.data();
            userMap.set(uId, {
              firstName: uData?.firstName,
              username: uData?.username,
              telegramId: uData?.telegramId,
            });
          }
        } catch {
          // ignore lookup errors
        }
      })
    );

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

    return NextResponse.json({ success: true, data: withdrawals, withdrawals });
  } catch (error) {
    return serverError(error);
  }
}
