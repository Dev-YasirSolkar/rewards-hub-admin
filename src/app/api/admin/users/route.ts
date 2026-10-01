import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { getCached, setCached } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_users', 60, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const forceRefresh = searchParams.get('refresh') === 'true';

    const cacheKey = `admin_users:${status}:${search}:${limit}`;
    if (!forceRefresh) {
      const cached = getCached<any>(cacheKey);
      if (cached) {
        return NextResponse.json({ success: true, data: cached, users: cached, cached: true });
      }
    }

    let query: any = adminDb.collection('users');

    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    let snapshot;
    try {
      snapshot = await query.orderBy('createdAt', 'desc').limit(limit).get();
    } catch {
      // Fallback if composite index on status + createdAt is missing
      snapshot = await query.limit(limit).get();
    }

    let users = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : data.createdAt
        ? new Date(data.createdAt).toISOString()
        : null;

      return {
        id: doc.id,
        telegramId: data.telegramId || doc.id,
        firstName: data.firstName || 'User',
        lastName: data.lastName || '',
        username: data.username || '',
        pointsBalance: data.pointsBalance || 0,
        balance: data.pointsBalance || 0,
        status: data.status || 'active',
        role: data.role || 'user',
        referralCount: data.referralCount || 0,
        lifetimeEarned: data.lifetimeEarned || 0,
        createdAt,
      };
    });

    if (search) {
      users = users.filter((u: any) =>
        (u.username && u.username.toLowerCase().includes(search)) ||
        (u.firstName && u.firstName.toLowerCase().includes(search)) ||
        String(u.telegramId).includes(search) ||
        String(u.id).includes(search)
      );
    }

    // Cache results for 30s
    setCached(cacheKey, users, 30);

    return NextResponse.json({ success: true, data: users, users, cached: false });
  } catch (error) {
    return serverError(error);
  }
}
