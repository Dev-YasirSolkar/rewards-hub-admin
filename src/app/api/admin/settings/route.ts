import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { adminSettingsSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';
import { getCached, setCached, invalidateCache } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_settings_get', 60, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (!forceRefresh) {
      const cached = getCached<any>('admin_settings');
      if (cached) {
        return NextResponse.json({ success: true, data: cached, cached: true });
      }
    }

    const doc = await adminDb.collection('adminSettings').doc('general').get();
    const data = doc.exists ? doc.data() : {};

    setCached('admin_settings', data, 60);
    
    return NextResponse.json({ 
      success: true, 
      data,
      cached: false
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_settings_put', 20, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    
    const validatedData = adminSettingsSchema.safeParse(body);
    if (!validatedData.success) {
      return badRequest(validatedData.error.issues.map((e: { message: string }) => e.message).join(', '));
    }

    await adminDb.collection('adminSettings').doc('general').set(
      { ...validatedData.data, updatedAt: new Date() },
      { merge: true }
    );

    await createAuditLog({
      performedBy: admin.id,
      action: 'update_settings',
      details: validatedData.data
    });

    invalidateCache('admin_settings');
    invalidateCache('admin_dashboard');

    return NextResponse.json({ success: true, data: validatedData.data });
  } catch (error) {
    return serverError(error);
  }
}
