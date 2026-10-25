import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdminAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { clearAllCache, invalidateCache } from '@/lib/cache';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_cache_invalidate', 20, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const target = body.target || body.key || 'all';
    const now = Date.now();

    // 1. Wipe in-memory caches inside the Admin App
    clearAllCache();

    if (target === 'all' || target === 'global' || target === 'all_users') {
      // 2. Persist new globalCacheVersion in Firestore adminSettings/general doc.
      // Every user app (telegram-rewards-hub) reads this on bootstrap & tap sync.
      // When serverCacheVersion > localCacheVer, user devices wipe their local storage cache!
      await adminDb.collection('adminSettings').doc('general').set({
        globalCacheVersion: now,
        updatedAt: new Date(),
      }, { merge: true });

      invalidateCache('admin_settings');
      invalidateCache('admin_dashboard');

      await createAuditLog({
        performedBy: 'admin',
        action: 'invalidate_all_users_cache',
        details: { target: 'all', globalCacheVersion: now },
      });

      return NextResponse.json({
        success: true,
        message: 'Global cache invalidated successfully for all users and admin.',
        globalCacheVersion: now,
      });
    }

    // Specific cache invalidations
    if (target === 'mining') {
      invalidateCache('miningCards');
      invalidateCache('admin_settings');
    } else if (target === 'tasks') {
      invalidateCache('tasks');
    } else if (target === 'affiliates') {
      invalidateCache('affiliates');
    } else {
      invalidateCache(target);
    }

    return NextResponse.json({
      success: true,
      message: `Cache invalidated for target: ${target}`,
      invalidatedAt: now,
    });
  } catch (error: any) {
    console.error('Cache invalidate error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
