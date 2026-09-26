'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-client';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/api/admin/dashboard');
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res.error || 'Failed to load stats');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px' }}>Platform Metrics</h2>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '13px' }}>Loading real-time platform statistics...</p>
          </div>
        </div>
        <div className="admin-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="admin-card">
              <div className="stat-label">Metric</div>
              <div className="stat-value">--</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="admin-card" style={{ borderColor: '#ef4444' }}>
          <p style={{ color: '#ef4444', margin: '0 0 12px', fontWeight: 600 }}>{error}</p>
          <button className="admin-button" onClick={fetchStats}>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const pendingWithdrawalsCount =
    typeof stats?.pendingWithdrawals === 'object'
      ? stats.pendingWithdrawals?.count ?? 0
      : stats?.pendingWithdrawals ?? 0;
  const pendingWithdrawalsSum =
    typeof stats?.pendingWithdrawals === 'object' ? stats.pendingWithdrawals?.sum ?? 0 : 0;

  const paidWithdrawalsCount =
    typeof stats?.paidWithdrawals === 'object'
      ? stats.paidWithdrawals?.count ?? 0
      : stats?.paidWithdrawals ?? 0;
  const paidWithdrawalsSum =
    typeof stats?.paidWithdrawals === 'object' ? stats.paidWithdrawals?.sum ?? 0 : 0;

  const statItems = [
    { label: 'Total Members', value: (stats?.totalUsers ?? 0).toLocaleString(), icon: '👥', color: '#3b82f6' },
    { label: 'Active Users', value: (stats?.activeUsers ?? 0).toLocaleString(), icon: '🟢', color: '#10b981' },
    { label: 'Joined Today', value: (stats?.newUsersToday ?? stats?.newToday ?? 0).toLocaleString(), icon: '✨', color: '#f59e0b' },
    {
      label: 'Points Distributed',
      value: `${(stats?.totalRewardsDistributed ?? stats?.totalRewards ?? 0).toLocaleString()} pts`,
      icon: '💰',
      color: '#f59e0b',
    },
    {
      label: 'Pending Payouts',
      value: `${pendingWithdrawalsCount} (${pendingWithdrawalsSum.toLocaleString()} pts)`,
      icon: '⏳',
      color: '#ef4444',
    },
    {
      label: 'Settled Payouts',
      value: `${paidWithdrawalsCount} (${paidWithdrawalsSum.toLocaleString()} pts)`,
      icon: '✅',
      color: '#10b981',
    },
    { label: 'Active Tasks', value: (stats?.activeTasks ?? 0).toLocaleString(), icon: '📋', color: '#3b82f6' },
    { label: 'Task Claims Today', value: (stats?.taskCompletionsToday ?? 0).toLocaleString(), icon: '🎯', color: '#10b981' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px', color: '#f8fafc' }}>
            System Dashboard
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '13px' }}>
            Real-time telemetry, user acquisition, task engagement, and financial payouts.
          </p>
        </div>
        <button
          className="admin-button"
          onClick={fetchStats}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          ↻ Refresh Metrics
        </button>
      </div>

      {/* Grid of Key Performance Indicators */}
      <div className="admin-grid">
        {statItems.map((item, i) => (
          <div key={i} className="admin-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div className="stat-label">{item.label}</div>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
            </div>
            <div className="stat-value" style={{ color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Action Control Hub */}
      <div className="admin-card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px', color: '#f8fafc' }}>
          ⚡ Admin Operations & Quick Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <Link
            href="/dashboard/withdrawals"
            style={{
              padding: '14px',
              borderRadius: '10px',
              background: '#090d16',
              border: '1px solid #1e293b',
              textDecoration: 'none',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Review Payouts</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Approve UPI & Bank transfers</div>
            </div>
            <span>→</span>
          </Link>

          <Link
            href="/dashboard/tasks"
            style={{
              padding: '14px',
              borderRadius: '10px',
              background: '#090d16',
              border: '1px solid #1e293b',
              textDecoration: 'none',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Create New Task</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Channels, websites & social</div>
            </div>
            <span>→</span>
          </Link>

          <Link
            href="/dashboard/notifications"
            style={{
              padding: '14px',
              borderRadius: '10px',
              background: '#090d16',
              border: '1px solid #1e293b',
              textDecoration: 'none',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Broadcast Message</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Push announcement to users</div>
            </div>
            <span>→</span>
          </Link>

          <Link
            href="/dashboard/settings"
            style={{
              padding: '14px',
              borderRadius: '10px',
              background: '#090d16',
              border: '1px solid #1e293b',
              textDecoration: 'none',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Ad Network & Settings</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Tune rewards & rate limits</div>
            </div>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

