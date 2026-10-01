import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';
import { getCached, setCached, invalidateCache } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_fraud', 60, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || (searchParams.get('resolved') === 'true' ? 'resolved' : searchParams.get('resolved') === 'false' ? 'unresolved' : 'all');
    const limit = parseInt(searchParams.get('limit') || '50');
    const forceRefresh = searchParams.get('refresh') === 'true';

    const cacheKey = `admin_fraud:${status}:${limit}`;
    if (!forceRefresh) {
      const cached = getCached<any>(cacheKey);
      if (cached) {
        return NextResponse.json({ success: true, data: cached, flags: cached, cached: true });
      }
    }

    let query: any = adminDb.collection('fraudFlags');

    if (status === 'resolved') {
      query = query.where('resolved', '==', true);
    } else if (status === 'unresolved') {
      query = query.where('resolved', '==', false);
    }

    let snapshot;
    try {
      snapshot = await query.orderBy('createdAt', 'desc').limit(limit).get();
    } catch {
      snapshot = await query.limit(limit).get();
    }

    const flags = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : data.createdAt
        ? new Date(data.createdAt).toISOString()
        : null;

      return {
        id: doc.id,
        ...data,
        createdAt,
      };
    });

    setCached(cacheKey, flags, 30);

    return NextResponse.json({ success: true, data: flags, flags, cached: false });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_fraud_resolve', 30, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const flagId = body.flagId || body.id;

    if (!flagId) return badRequest('flagId is required');

    let suspendedUntil: string | null = null;
    if (body.suspendUser && body.userId) {
      const duration = body.duration || 'permanent';
      const reason = body.reason || 'Suspended via Fraud Monitoring alert';
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
      } else if (duration === 'custom' && body.customHours) {
        suspendedUntil = new Date(now + Number(body.customHours) * 3600_000).toISOString();
      } else {
        suspendedUntil = null;
      }

      await adminDb.collection('users').doc(body.userId).update({
        status: 'suspended',
        suspendedUntil,
        suspendReason: reason,
        suspendedAt: new Date(),
        updatedAt: new Date(),
      });

      await createAuditLog({
        performedBy: admin.id,
        action: 'suspend_user_via_fraud',
        details: { userId: body.userId, flagId, duration, suspendedUntil, reason },
      });
    }

    const flagRef = adminDb.collection('fraudFlags').doc(flagId);
    await flagRef.update({
      resolved: true,
      resolvedBy: admin.id,
      resolvedAt: new Date(),
      resolutionAction: body.suspendUser ? 'suspended_user' : 'resolved_manually',
    });

    await createAuditLog({
      performedBy: admin.id,
      action: 'resolve_fraud_flag',
      details: { flagId, suspendUser: !!body.suspendUser },
    });

    invalidateCache('admin_fraud');
    invalidateCache('admin_users');
    invalidateCache('admin_dashboard');

    return NextResponse.json({ success: true, suspendedUntil });
  } catch (error) {
    return serverError(error);
  }
}
