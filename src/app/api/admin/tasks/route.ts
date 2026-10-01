import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { taskCreateSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';
import { getCached, setCached, invalidateCache } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_tasks_list', 60, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (!forceRefresh) {
      const cached = getCached<any>('admin_tasks');
      if (cached) {
        return NextResponse.json({ success: true, data: cached, tasks: cached, cached: true });
      }
    }

    const snapshot = await adminDb.collection('tasks').orderBy('createdAt', 'desc').get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Cache tasks for 60 seconds
    setCached('admin_tasks', tasks, 60);

    return NextResponse.json({ success: true, data: tasks, tasks, cached: false });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_task_create', 20, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const validatedData = taskCreateSchema.safeParse(body);
    
    if (!validatedData.success) {
      return badRequest(validatedData.error.issues.map((e: { message: string }) => e.message).join(', '));
    }

    const taskData = {
      ...validatedData.data,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await adminDb.collection('tasks').add(taskData);

    await createAuditLog({
      performedBy: admin.id,
      action: 'create_task',
      details: { taskId: docRef.id, ...validatedData.data }
    });

    invalidateCache('admin_tasks');
    invalidateCache('admin_dashboard');

    return NextResponse.json({ success: true, data: { id: docRef.id, ...taskData } });
  } catch (error) {
    return serverError(error);
  }
}
