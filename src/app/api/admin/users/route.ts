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
      if (status === 'suspended') {
        query = query.where('status', '==', 'suspended');
      } else {
        query = query.where('status', '==', status);
      }
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

      const coinsBalance = data.coins !== undefined ? Number(data.coins) : Number(data.pointsBalance || data.balance || 0);
      const lifetime = Math.max(coinsBalance, Number(data.totalEarned || 0), Number(data.lifetimeEarned || 0));

      return {
        id: doc.id,
        telegramId: data.telegramId || doc.id,
        firstName: data.firstName || 'Miner',
        lastName: data.lastName || '',
        username: data.username || '',
        pointsBalance: coinsBalance,
        balance: coinsBalance,
        coins: coinsBalance,
        level: Number(data.level || 1),
        profitPerHour: Number(data.profitPerHour || 0),
        energy: Number(data.energy || 1000),
        maxEnergy: Number(data.maxEnergy || 1000),
        status: data.isBanned ? 'suspended' : (data.status || 'active'),
        isBanned: Boolean(data.isBanned || data.status === 'suspended'),
        suspendedUntil: data.suspendedUntil || null,
        role: data.role || 'user',
        referralCount: Number(data.referralsCount || data.referralCount || (data.referrals ? data.referrals.length : 0)),
        lifetimeEarned: lifetime,
        createdAt,
      };
    });

    if (search) {
      users = users.filter((u: any) =>
        (u.username && u.username.toLowerCase().includes(search)) ||
        (u.firstName && u.firstName.toLowerCase().includes(search)) ||
        (u.lastName && u.lastName.toLowerCase().includes(search)) ||
        String(u.telegramId).includes(search) ||
        String(u.id).includes(search)
      );
    }

    // Cache results for 15s
    setCached(cacheKey, users, 15);

    return NextResponse.json({ success: true, data: users, users, cached: false });
  } catch (error) {
    return serverError(error);
  }
}
