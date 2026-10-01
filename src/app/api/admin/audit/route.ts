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
    if (!(await rateLimit(ip, 'admin_audit', 60, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const cacheKey = `admin_audit:${limit}`;
    if (!forceRefresh) {
      const cached = getCached<any>(cacheKey);
      if (cached) {
        return NextResponse.json({ success: true, data: cached, logs: cached, cached: true });
      }
    }

    const snapshot = await adminDb.collection('auditLogs').orderBy('createdAt', 'desc').limit(limit).get();
    const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    setCached(cacheKey, logs, 30);

    return NextResponse.json({
      success: true,
      data: logs,
      logs,
      cached: false,
    });
  } catch (error) {
    return serverError(error);
  }
}
