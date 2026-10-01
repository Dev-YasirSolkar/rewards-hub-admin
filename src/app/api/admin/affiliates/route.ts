import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { getCached, setCached, invalidateCache } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_affiliates_get', 60, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (!forceRefresh) {
      const cached = getCached<any>('admin_affiliates');
      if (cached) {
        return NextResponse.json({ success: true, data: cached, campaigns: cached, cached: true });
      }
    }

    const snapshot = await adminDb.collection('affiliateCampaigns').orderBy('createdAt', 'desc').get();
    const campaigns = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    setCached('admin_affiliates', campaigns, 60);

    return NextResponse.json({
      success: true,
      data: campaigns,
      campaigns,
      cached: false,
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const body = await request.json();
    const { name, description, targetUrl, reward, active } = body;

    const docRef = await adminDb.collection('affiliateCampaigns').add({
      name: name || 'Affiliate Campaign',
      description: description || '',
      targetUrl: targetUrl || '',
      reward: Number(reward) || 50,
      active: active !== false,
      clicks: 0,
      conversions: 0,
      createdAt: new Date(),
    });

    invalidateCache('admin_affiliates');

    return NextResponse.json({
      success: true,
      data: { id: docRef.id },
    });
  } catch (error) {
    return serverError(error);
  }
}
