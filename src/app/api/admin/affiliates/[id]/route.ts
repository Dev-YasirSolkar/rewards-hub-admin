import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';
import { invalidateCache } from '@/lib/cache';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_affiliate_update', 30, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.targetUrl !== undefined) updateData.targetUrl = body.targetUrl;
    if (body.reward !== undefined) updateData.reward = Number(body.reward);
    if (body.active !== undefined) updateData.active = Boolean(body.active);

    const docRef = adminDb.collection('affiliateCampaigns').doc(id);
    await docRef.update(updateData);

    await createAuditLog({
      performedBy: admin.id,
      action: 'update_affiliate_campaign',
      details: { campaignId: id, updateData },
    });

    invalidateCache('admin_affiliates');

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_affiliate_delete', 30, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id } = await params;

    const docRef = adminDb.collection('affiliateCampaigns').doc(id);
    await docRef.delete();

    await createAuditLog({
      performedBy: admin.id,
      action: 'delete_affiliate_campaign',
      details: { campaignId: id },
    });

    invalidateCache('admin_affiliates');

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
