import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { AggregateField } from 'firebase-admin/firestore';
import { getCached, setCached } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_dashboard', 60, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    // 1. Check in-memory cache (reduces reads to 0 on subsequent page visits)
    if (!forceRefresh) {
      const cached = getCached<any>('admin_dashboard');
      if (cached) {
        return NextResponse.json({ success: true, data: cached, cached: true });
      }
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let totalUsers = 0;
    let activeUsers = 0;
    let newUsersToday = 0;
    let pendingWithdrawalsCount = 0;
    let pendingWithdrawalsSum = 0;
    let paidWithdrawalsCount = 0;
    let paidWithdrawalsSum = 0;
    let activeTasksCount = 0;
    let totalRewards = 0;

    // 2. Fetch User Metrics via Aggregation (Cost: 1 read per count instead of reading thousands of user docs)
    try {
      const [totalCountSnap, activeCountSnap] = await Promise.all([
        adminDb.collection('users').count().get(),
        adminDb.collection('users').where('status', '==', 'active').count().get(),
      ]);
      totalUsers = totalCountSnap.data().count || 0;
      activeUsers = activeCountSnap.data().count || 0;

      // New users today query (1 read)
      try {
        const todaySnap = await adminDb
          .collection('users')
          .where('createdAt', '>=', todayStart)
          .count()
          .get();
        newUsersToday = todaySnap.data().count || 0;
      } catch {
        // In case index on createdAt is missing, query small limit
        const recentSnap = await adminDb.collection('users').limit(50).get();
        newUsersToday = recentSnap.docs.filter((d) => {
          const cAt = d.data()?.createdAt;
          const dt = cAt?.toDate ? cAt.toDate() : cAt ? new Date(cAt) : null;
          return dt && dt >= todayStart;
        }).length;
      }
    } catch (e) {
      console.warn('Dashboard users aggregation fallback:', e);
      // Minimal fallback query
      const fallbackSnap = await adminDb.collection('users').limit(100).get();
      totalUsers = fallbackSnap.size;
      activeUsers = fallbackSnap.docs.filter((d) => d.data().status === 'active').length;
    }

    // 3. Fetch Withdrawal Metrics via Aggregations (Cost: 1 read per status instead of reading thousands of docs)
    try {
      const [pendingAggSnap, paidAggSnap] = await Promise.all([
        adminDb
          .collection('withdrawals')
          .where('status', '==', 'pending')
          .aggregate({
            count: AggregateField.count(),
            sum: AggregateField.sum('amount'),
          })
          .get(),
        adminDb
          .collection('withdrawals')
          .where('status', 'in', ['paid', 'approved', 'success'])
          .aggregate({
            count: AggregateField.count(),
            sum: AggregateField.sum('amount'),
          })
          .get(),
      ]);

      const pData = pendingAggSnap.data();
      pendingWithdrawalsCount = pData.count || 0;
      pendingWithdrawalsSum = pData.sum || 0;

      const paidData = paidAggSnap.data();
      paidWithdrawalsCount = paidData.count || 0;
      paidWithdrawalsSum = paidData.sum || 0;
    } catch (e) {
      console.warn('Dashboard withdrawals aggregation fallback:', e);
      try {
        const wSnap = await adminDb.collection('withdrawals').limit(100).get();
        wSnap.docs.forEach((doc) => {
          const d = doc.data();
          const amt = Number(d.amount) || 0;
          if (d.status === 'pending') {
            pendingWithdrawalsCount++;
            pendingWithdrawalsSum += amt;
          } else if (['paid', 'approved', 'success'].includes(d.status)) {
            paidWithdrawalsCount++;
            paidWithdrawalsSum += amt;
          }
        });
      } catch (err) {
        console.error('Withdrawals fallback error:', err);
      }
    }

    // 4. Active Tasks Count (Cost: 1 aggregation read)
    try {
      const tCountSnap = await adminDb.collection('tasks').where('active', '==', true).count().get();
      activeTasksCount = tCountSnap.data().count || 0;
    } catch {
      const tSnap = await adminDb.collection('tasks').where('active', '==', true).limit(50).get();
      activeTasksCount = tSnap.size;
    }

    // 5. Total Rewards Distributed from settings document (Cost: 1 read)
    try {
      const settingsDoc = await adminDb.collection('adminSettings').doc('general').get();
      if (settingsDoc.exists) {
        totalRewards = settingsDoc.data()?.totalRewardsDistributed || 0;
      }
      if (totalRewards === 0) {
        // Fallback: estimate or query small slice
        const txSnap = await adminDb.collection('transactions').where('amount', '>', 0).limit(25).get();
        totalRewards = txSnap.docs.reduce((acc, doc) => acc + (Number(doc.data().amount) || 0), 0);
      }
    } catch (e) {
      console.error('Dashboard rewards fetch error:', e);
    }

    const telemetryData = {
      totalUsers,
      activeUsers,
      newUsersToday,
      totalRewardsDistributed: totalRewards,
      pendingWithdrawals: {
        count: pendingWithdrawalsCount,
        sum: pendingWithdrawalsSum,
      },
      paidWithdrawals: {
        count: paidWithdrawalsCount,
        sum: paidWithdrawalsSum,
      },
      activeTasks: activeTasksCount,
      updatedAt: new Date().toISOString(),
    };

    // Cache for 60 seconds (cuts repeated dashboard reads to 0)
    setCached('admin_dashboard', telemetryData, 60);

    return NextResponse.json({
      success: true,
      data: telemetryData,
      cached: false,
    });
  } catch (error) {
    return serverError(error);
  }
}
