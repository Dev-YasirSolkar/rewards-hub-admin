import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';
import { sendTelegramMessage } from '@/lib/notifications';
import { getCached, setCached, invalidateCache } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_notifications_get', 60, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const forceRefresh = searchParams.get('refresh') === 'true';

    const cacheKey = `admin_broadcasts:${limit}`;
    if (!forceRefresh) {
      const cached = getCached<any>(cacheKey);
      if (cached) {
        return NextResponse.json({ success: true, data: cached, notifications: cached, cached: true });
      }
    }

    let snapshot;
    try {
      snapshot = await adminDb.collection('broadcasts').orderBy('createdAt', 'desc').limit(limit).get();
    } catch {
      snapshot = await adminDb.collection('broadcasts').limit(limit).get();
    }

    const broadcasts = snapshot.docs.map(doc => {
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

    setCached(cacheKey, broadcasts, 60);

    return NextResponse.json({ success: true, data: broadcasts, notifications: broadcasts, cached: false });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_notifications_post', 20, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const { title, message, target } = body;

    if (!title || !message) {
      return badRequest('Title and message are required');
    }

    let sentCount = 0;
    try {
      let query: any = adminDb.collection('users');
      if (target === 'active') {
        query = query.where('status', '==', 'active');
      }
      const usersSnap = await query.limit(200).get();

      for (const doc of usersSnap.docs) {
        const u = doc.data();
        const tgId = u.telegramId;
        if (tgId) {
          try {
            await sendTelegramMessage(tgId, `📢 <b>${title}</b>\n\n${message}`);
            sentCount++;
          } catch (e) {
            console.error('Failed delivering broadcast to user:', tgId, e);
          }
        }
      }
    } catch (e) {
      console.error('Broadcast delivery batch error:', e);
    }

    const broadcastData = {
      title,
      message,
      target: target || 'all',
      sentCount,
      createdAt: new Date(),
      createdBy: admin.id,
      status: 'sent',
    };

    const docRef = await adminDb.collection('broadcasts').add(broadcastData);

    await createAuditLog({
      performedBy: admin.id,
      action: 'send_broadcast',
      details: { broadcastId: docRef.id, title, target, sentCount },
    });

    invalidateCache('admin_broadcasts');

    return NextResponse.json({ success: true, data: { id: docRef.id, ...broadcastData } });
  } catch (error) {
    return serverError(error);
  }
}
