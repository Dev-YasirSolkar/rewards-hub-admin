import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { taskCreateSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_task_update', 30, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const validatedData = taskCreateSchema.partial().safeParse(body);
    if (!validatedData.success) {
      return badRequest(validatedData.error.issues.map((e: { message: string }) => e.message).join(', '));
    }

    const taskRef = adminDb.collection('tasks').doc(id);
    await taskRef.update({
      ...validatedData.data,
      updatedAt: new Date()
    });

    await createAuditLog({
      performedBy: admin.id,
      action: 'update_task',
      details: { taskId: id, updates: validatedData.data }
    });

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
    if (!(await rateLimit(ip, 'admin_task_delete', 30, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id } = await params;
    
    const taskRef = adminDb.collection('tasks').doc(id);
    await taskRef.update({
      active: false,
      updatedAt: new Date()
    });

    await createAuditLog({
      performedBy: admin.id,
      action: 'delete_task',
      details: { taskId: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
