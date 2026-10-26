'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-client';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clearingCache, setClearingCache] = useState(false);

  const handleClearAllUsersCache = async () => {
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to delete and wipe caches for ALL users across the entire system?\n\nThis will force all user devices across Telegram to wipe their cached balances, local taps, and configurations, and reload fresh state from the database.'
    );
    if (!confirmed) return;

    setClearingCache(true);
    try {
      const res = await adminFetch('/api/admin/cache-invalidate', {
        method: 'POST',
        body: JSON.stringify({ target: 'all' }),
      });
      if (res.success) {
        alert('✅ All users cache successfully invalidated and wiped!');
      } else {
        alert(`❌ ${res.error || 'Failed to invalidate cache'}`);
      }
    } catch (e: any) {
      alert(`❌ Error: ${e.message || 'Network error'}`);
    } finally {
      setClearingCache(false);
    }
  };

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

  const formatInt = (val: any) => Math.floor(Number(val) || 0).toLocaleString();

  const pendingWithdrawalsCount =
    typeof stats?.pendingWithdrawals === 'object'
      ? Math.floor(Number(stats.pendingWithdrawals?.count) || 0)
      : Math.floor(Number(stats?.pendingWithdrawals) || 0);
  const pendingWithdrawalsSum =
    typeof stats?.pendingWithdrawals === 'object' ? Math.floor(Number(stats.pendingWithdrawals?.sum) || 0) : 0;

  const paidWithdrawalsCount =
    typeof stats?.paidWithdrawals === 'object'
      ? Math.floor(Number(stats.paidWithdrawals?.count) || 0)
      : Math.floor(Number(stats?.paidWithdrawals) || 0);
  const paidWithdrawalsSum =
    typeof stats?.paidWithdrawals === 'object' ? Math.floor(Number(stats.paidWithdrawals?.sum) || 0) : 0;

  const solkInCirculation = Math.floor(Number(stats?.totalRewardsDistributed ?? stats?.totalRewards ?? 0) || 0);

  const statItems = [
    { label: 'Total Registered Chefs', value: formatInt(stats?.totalUsers), icon: '👨‍🍳', color: '#FDE047', aura: 'rgba(253, 224, 71, 0.25)' },
    { label: 'Active 24h Chefs', value: formatInt(stats?.activeUsers), icon: '🟢', color: '#34d399', aura: 'rgba(52, 211, 153, 0.25)' },
    { label: 'New Chefs Today', value: formatInt(stats?.newUsersToday ?? stats?.newToday), icon: '✨', color: '#F59E0B', aura: 'rgba(245, 158, 11, 0.25)' },
    {
      label: '$SOLK In Circulation',
      value: `${formatInt(solkInCirculation)} $SOLK`,
      icon: '💰',
      color: '#FDE047',
      aura: 'rgba(253, 224, 71, 0.25)'
    },
    {
      label: 'Pending Payouts',
      value: `${formatInt(pendingWithdrawalsCount)} (${formatInt(pendingWithdrawalsSum)} $SOLK)`,
      icon: '⏳',
      color: '#F87171',
      aura: 'rgba(248, 113, 113, 0.25)'
    },
    {
      label: 'Settled Payouts',
      value: `${formatInt(paidWithdrawalsCount)} (${formatInt(paidWithdrawalsSum)} $SOLK)`,
      icon: '✅',
      color: '#10B981',
      aura: 'rgba(16, 185, 129, 0.25)'
    },
    { label: 'Active Quests', value: formatInt(stats?.activeTasks), icon: '📋', color: '#a78bfa', aura: 'rgba(167, 139, 250, 0.25)' },
    { label: 'Quest Claims Today', value: formatInt(stats?.taskCompletionsToday), icon: '🎯', color: '#38bdf8', aura: 'rgba(56, 189, 248, 0.25)' },
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
              Live Yasir Fest Matrix Node
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 4px', color: '#f8fafc', letterSpacing: '-0.4px' }}>
            Yasir Fest Operations &amp; Control
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '13px' }}>
            Real-time telemetry, 10-career positions, passive kitchen economy, and payout auditing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="admin-button"
            onClick={handleClearAllUsersCache}
            disabled={clearingCache}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              background: clearingCache ? 'rgba(239, 68, 68, 0.5)' : '#ef4444',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
            }}
          >
            {clearingCache ? 'Wiping Cache...' : '🗑️ Wipe All Users Cache'}
          </button>
          <button
            className="admin-button"
            onClick={() => fetchStats(true)}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            ↻ Refresh Node Stats
          </button>
        </div>
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
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8' }}>👥 Chefs &amp; Positions</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>10 Career levels, $SOLK &amp; bans</div>
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
