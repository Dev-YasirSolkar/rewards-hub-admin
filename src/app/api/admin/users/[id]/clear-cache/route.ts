import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError } from '@/lib/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_user_clear_cache', 30, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();

    // Find actual doc reference
    let userRef = adminDb.collection('users').doc(cleanId);
    let userDoc = await userRef.get();

    if (!userDoc.exists) {
      const numId = Number(cleanId);
      if (!isNaN(numId)) {
        const snap = await adminDb.collection('users').where('telegramId', '==', numId).limit(1).get();
        if (!snap.empty) {
          userRef = snap.docs[0].ref;
          userDoc = snap.docs[0];
        }
      }
    }

    if (!userDoc.exists) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const newCacheVersion = Date.now();
    await userRef.update({
      cacheVersion: newCacheVersion,
      energyPerSecond: 1,
      lastEnergyAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: userRef.id,
        cacheVersion: newCacheVersion,
        message: 'User local caches and buffer invalidated successfully',
      },
    });
  } catch (error) {
    console.error('Error clearing user cache:', error);
    return serverError(error);
  }
}
