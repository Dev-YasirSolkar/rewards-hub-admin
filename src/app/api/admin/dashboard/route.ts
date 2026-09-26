import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'admin_dashboard', 30, 60))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
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

    // 1. Total users
    try {
      const snap = await adminDb.collection('users').get();
      totalUsers = snap.size;
      snap.docs.forEach((doc) => {
        const d = doc.data();
        if (d.status === 'active') activeUsers++;
        const createdAt = d.createdAt?.toDate ? d.createdAt.toDate() : d.createdAt ? new Date(d.createdAt) : null;
        if (createdAt && createdAt >= todayStart) {
          newUsersToday++;
        }
      });
    } catch (e) {
      console.error('Error fetching users for dashboard:', e);
    }

    // 2. Withdrawals
    try {
      const wSnap = await adminDb.collection('withdrawals').get();
      wSnap.docs.forEach((doc) => {
        const d = doc.data();
        const amt = Number(d.amount) || 0;
        if (d.status === 'pending') {
          pendingWithdrawalsCount++;
          pendingWithdrawalsSum += amt;
        } else if (d.status === 'paid' || d.status === 'approved') {
          paidWithdrawalsCount++;
          paidWithdrawalsSum += amt;
        }
      });
    } catch (e) {
      console.error('Error fetching withdrawals for dashboard:', e);
    }

    // 3. Active tasks
    try {
      const tSnap = await adminDb.collection('tasks').where('active', '==', true).get();
      activeTasksCount = tSnap.size;
    } catch (e) {
      console.error('Error fetching tasks for dashboard:', e);
    }

    // 4. Total rewards from settings or calculate from lifetimeEarned
    try {
      const settingsDoc = await adminDb.collection('adminSettings').doc('general').get();
      if (settingsDoc.exists) {
        totalRewards = settingsDoc.data()?.totalRewardsDistributed || 0;
      }
      if (totalRewards === 0) {
        // Fallback: sum of positive transactions
        const txSnap = await adminDb.collection('transactions').where('amount', '>', 0).limit(100).get();
        totalRewards = txSnap.docs.reduce((acc, doc) => acc + (Number(doc.data().amount) || 0), 0);
      }
    } catch (e) {
      console.error('Error fetching rewards for dashboard:', e);
    }

    return NextResponse.json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
