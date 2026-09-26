import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { adminSettingsSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_settings_get', 60, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const doc = await adminDb.collection('adminSettings').doc('general').get();
    
    return NextResponse.json({ 
      success: true, 
      data: doc.exists ? doc.data() : {} 
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

    return NextResponse.json({ success: true, data: validatedData.data });
  } catch (error) {
    return serverError(error);
  }
}
