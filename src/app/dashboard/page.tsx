'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-client';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async (force: boolean = false) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch(force ? '/api/admin/dashboard?refresh=true' : '/api/admin/dashboard');
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
            <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 4px', color: '#fff' }}>Platform Telemetry</h2>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '13px' }}>Loading real-time cluster statistics...</p>
          </div>
        </div>
        <div className="admin-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="stat-card" style={{ height: '110px' }}>
              <div className="stat-label">Metric Loading</div>
              <div className="stat-value" style={{ color: '#64748b' }}>--</div>
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
          <p style={{ color: '#ef4444', margin: '0 0 12px', fontWeight: 700 }}>{error}</p>
          <button className="admin-button" onClick={() => fetchStats(true)}>
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
    { label: 'Total Registered Miners', value: (stats?.totalUsers ?? 0).toLocaleString(), icon: '👥', color: '#38bdf8', aura: 'rgba(56, 189, 248, 0.25)' },
    { label: 'Active 24h Miners', value: (stats?.activeUsers ?? 0).toLocaleString(), icon: '🟢', color: '#34d399', aura: 'rgba(52, 211, 153, 0.25)' },
    { label: 'New Miners Today', value: (stats?.newUsersToday ?? stats?.newToday ?? 0).toLocaleString(), icon: '✨', color: '#FDE047', aura: 'rgba(253, 224, 71, 0.25)' },
    {
      label: 'Doracakes In Circulation',
      value: `${(stats?.totalRewardsDistributed ?? stats?.totalRewards ?? 0).toLocaleString()} 🥞`,
      icon: '🥞',
      color: '#F59E0B',
      aura: 'rgba(245, 158, 11, 0.25)'
    },
    {
      label: 'Pending Payouts',
      value: `${pendingWithdrawalsCount} (${pendingWithdrawalsSum.toLocaleString()} 🥞)`,
      icon: '⏳',
      color: '#F87171',
      aura: 'rgba(248, 113, 113, 0.25)'
    },
    {
      label: 'Settled Payouts',
      value: `${paidWithdrawalsCount} (${paidWithdrawalsSum.toLocaleString()} 🥞)`,
      icon: '✅',
      color: '#10B981',
      aura: 'rgba(16, 185, 129, 0.25)'
    },
    { label: 'Active Quests', value: (stats?.activeTasks ?? 0).toLocaleString(), icon: '📋', color: '#a78bfa', aura: 'rgba(167, 139, 250, 0.25)' },
    { label: 'Quest Claims Today', value: (stats?.taskCompletionsToday ?? 0).toLocaleString(), icon: '🎯', color: '#38bdf8', aura: 'rgba(56, 189, 248, 0.25)' },
  ];

  return (
    <div>
      {/* ── TOP HEADER ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '6px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#34d399', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              Live Doraemon Matrix Node
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 4px', color: '#f8fafc', letterSpacing: '-0.4px' }}>
            Rewards Hub Operations &amp; Control
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '13px' }}>
            Real-time telemetry, 7-character tiers, passive mining economy, and payout auditing.
          </p>
        </div>

        <button
          className="admin-button"
          onClick={() => fetchStats(true)}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          ↻ Refresh Node Stats
        </button>
      </div>

      {/* ── LUMINOUS KPI GRID ────────────────────────────────────────────── */}
      <div className="admin-grid">
        {statItems.map((item, i) => (
          <div key={i} className="stat-card" style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
            {/* Radial Aura Backlight */}
            <div style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${item.aura} 0%, transparent 70%)`,
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
              <div className="stat-label">{item.label}</div>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
            </div>
            <div className="stat-value" style={{ color: item.color, position: 'relative', zIndex: 1 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── QUICK ACTION CONTROL HUB ─────────────────────────────────────── */}
      <div className="admin-card">
        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚡ Admin Operations &amp; Fast Navigation</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <Link
            href="/dashboard/mining-cards"
            style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              textDecoration: 'none',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#f59e0b' }}>⛏️ Mining Cards</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Add &amp; auto-tune gadget cards</div>
            </div>
            <span style={{ fontSize: '18px', color: '#f59e0b' }}>→</span>
          </Link>

          <Link
            href="/dashboard/daily-activities"
            style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              textDecoration: 'none',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#f87171' }}>🎯 Cipher &amp; Combo</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Set daily mystery codes &amp; cards</div>
            </div>
            <span style={{ fontSize: '18px', color: '#f87171' }}>→</span>
          </Link>

          <Link
            href="/dashboard/users"
            style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              textDecoration: 'none',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8' }}>👥 Miners &amp; Tiers</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Character tiers, Doracakes &amp; bans</div>
            </div>
            <span style={{ fontSize: '18px', color: '#38bdf8' }}>→</span>
          </Link>

          <Link
            href="/dashboard/withdrawals"
            style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              textDecoration: 'none',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#FDE047' }}>💳 Review Payouts</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Approve TON, USDT &amp; UPI payouts</div>
            </div>
            <span style={{ fontSize: '18px', color: '#FDE047' }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
