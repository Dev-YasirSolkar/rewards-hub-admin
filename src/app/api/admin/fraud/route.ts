import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';

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

    return NextResponse.json({ success: true, data: flags, flags });
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

    const flagRef = adminDb.collection('fraudFlags').doc(flagId);
    await flagRef.update({
      resolved: true,
      resolvedBy: admin.id,
      resolvedAt: new Date(),
    });

    await createAuditLog({
      performedBy: admin.id,
      action: 'resolve_fraud_flag',
      details: { flagId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
