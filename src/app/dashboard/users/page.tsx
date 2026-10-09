'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-client';

const CHARACTER_TIERS: Record<number, { name: string; avatar: string; color: string }> = {
  1: { name: 'Food Noob', avatar: '🍳', color: '#f59e0b' },
  2: { name: 'Delivery Rider', avatar: '🛵', color: '#eab308' },
  3: { name: 'Senior Rider', avatar: '⚡', color: '#ec4899' },
  4: { name: 'Street Food Vendor', avatar: '🌮', color: '#38bdf8' },
  5: { name: 'Cafe Owner', avatar: '☕', color: '#f97316' },
  6: { name: 'Restaurant Manager', avatar: '👨‍🍳', color: '#facc15' },
  7: { name: 'Restaurant Director', avatar: '🎩', color: '#3b82f6' },
  8: { name: 'Food Tycoon', avatar: '🏢', color: '#a855f7' },
  9: { name: 'Food Mogul', avatar: '💎', color: '#ec4899' },
  10: { name: 'Global Food CEO', avatar: '👑', color: '#fbbf24' },
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  // Block/Suspend Modal state
  const [selectedUserForSuspend, setSelectedUserForSuspend] = useState<any | null>(null);
  const [suspendDuration, setSuspendDuration] = useState('24h');
  const [customHours, setCustomHours] = useState('48');
  const [suspendReason, setSuspendReason] = useState('');
  const [submittingSuspend, setSubmittingSuspend] = useState(false);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/users?status=${status}&search=${encodeURIComponent(search)}&refresh=true`);
      if (res.success && res.data) {
        setUsers(Array.isArray(res.data) ? res.data : (res.data as any).users || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUnblock = async (user: any) => {
    const name = user.firstName || user.username || user.telegramId || 'User';
    if (!confirm(`Are you sure you want to unblock / reactivate ${name}?`)) return;

    try {
      const res = await adminFetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active' }),
      });
      if (res.success) {
        alert(`${name} has been unblocked successfully!`);
        fetchUsers();
      } else {
        alert(res.error || 'Failed to unblock user');
      }
    } catch (err) {
      console.error(err);
      alert('Error unblocking user');
    }
  };

  const handleOpenBlockModal = (user: any) => {
    setSelectedUserForSuspend(user);
    setSuspendDuration('24h');
    setCustomHours('48');
    setSuspendReason('');
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForSuspend) return;

    setSubmittingSuspend(true);
    try {
      const res = await adminFetch(`/api/admin/users/${selectedUserForSuspend.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'suspended',
          duration: suspendDuration,
          customHours: suspendDuration === 'custom' ? customHours : undefined,
          reason: suspendReason.trim() || 'Suspended by Admin',
        }),
      });

      if (res.success) {
        alert(
          suspendDuration === 'permanent'
            ? 'User has been permanently suspended!'
            : `User suspended temporarily (${suspendDuration})!`
        );
        setSelectedUserForSuspend(null);
        fetchUsers();
      } else {
        alert(res.error || 'Failed to block user');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while blocking user');
    } finally {
      setSubmittingSuspend(false);
    }
  };

  const formatDate = (val: any) => {
    if (!val) return '—';
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
    } catch {
      return '—';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#f0f6fc' }}>Chefs &amp; Players Management</h2>
          <p style={{ margin: '4px 0 0', color: '#8b949e', fontSize: '0.875rem' }}>
            Inspect players, 10-Career Levels, $SOLK balances, hourly profits, and manage account statuses.
          </p>
        </div>
        <button onClick={fetchUsers} className="admin-button" style={{ padding: '6px 14px', fontSize: '13px' }}>
          ↻ Refresh
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="admin-card" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Search by username, name, or Telegram ID..." 
          className="admin-input"
          style={{ flex: 1, minWidth: '220px', margin: 0 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select 
          className="admin-input"
          style={{ width: 'auto', minWidth: '130px', margin: 0 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Chefs</option>
          <option value="suspended">Suspended / Banned</option>
        </select>
        <button type="submit" className="admin-button">Search</button>
      </form>

      <div className="admin-card admin-table-container">
        {loading ? (
          <div style={{ padding: '20px 16px' }}>
            <div className="skeleton-box" style={{ height: '38px', marginBottom: '8px' }} />
            <div className="skeleton-box" style={{ height: '38px', marginBottom: '8px' }} />
            <div className="skeleton-box" style={{ height: '38px', marginBottom: '8px' }} />
            <div className="skeleton-box" style={{ height: '38px' }} />
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Chef / User</th>
                <th>Career Position</th>
                <th>$SOLK Points 💰</th>
                <th>Profit / Hour</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#8b949e' }}>
                    No miners found matching your query.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSuspended = user.status === 'suspended' || user.isBanned;
                  const hasExpiry = isSuspended && user.suspendedUntil;
                  const isExpired = hasExpiry && new Date(user.suspendedUntil).getTime() <= Date.now();
                  const tier = CHARACTER_TIERS[user.level || 1] || CHARACTER_TIERS[1];

                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f0f6fc' }}>
                          {user.firstName} {user.lastName || ''}
                        </div>
                        {user.username ? (
                          <div style={{ fontSize: '0.8rem', color: '#58a6ff' }}>
                            @{user.username}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            ID: {user.telegramId || user.id}
                          </div>
                        )}
                      </td>
                      <td>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: `${tier.color}18`,
                            border: `1px solid ${tier.color}40`,
                            color: tier.color,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          <span>{tier.avatar}</span>
                          <span>Lvl {user.level || 1}: {tier.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#f59e0b' }}>
                          {(user.pointsBalance ?? user.coins ?? 0).toLocaleString()} 🥞
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#34d399' }}>
                          +{(user.profitPerHour || 0).toLocaleString()}/h
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: isSuspended && !isExpired ? '#da363320' : '#23863620',
                          color: isSuspended && !isExpired ? '#f85149' : '#3fb950',
                          whiteSpace: 'nowrap',
                        }}>
                          {isSuspended && !isExpired
                            ? (user.suspendedUntil ? 'Temp Blocked' : 'Banned') 
                            : 'Active'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#8b949e' }}>
                        {formatDate(user.createdAt)}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Link 
                          href={`/dashboard/users/${user.id}`}
                          className="admin-button"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', marginRight: '6px' }}
                        >
                          Details
                        </Link>
                        {isSuspended && !isExpired ? (
                          <button
                            onClick={() => handleUnblock(user)}
                            className="admin-button"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#238636', color: '#3fb950' }}
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenBlockModal(user)}
                            className="admin-button"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#da3633', color: '#f85149' }}
                          >
                            Block
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Suspend / Block Modal */}
      {selectedUserForSuspend && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '440px', margin: 0, border: '1px solid #da3633' }}>
            <h3 style={{ color: '#f85149', marginTop: 0, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🛑</span> Suspend / Ban Miner
            </h3>
            <p style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Apply a suspension or permanent ban to{' '}
              <b style={{ color: '#f0f6fc' }}>
                {selectedUserForSuspend.firstName || selectedUserForSuspend.username || selectedUserForSuspend.id}
              </b>
              .
            </p>

            <form onSubmit={handleBlockSubmit}>
              <div className="admin-form-group">
                <label className="admin-label">Duration</label>
                <select 
                  className="admin-input"
                  value={suspendDuration}
                  onChange={(e) => setSuspendDuration(e.target.value)}
                >
                  <option value="24h">24 Hours (1 Day)</option>
                  <option value="48h">48 Hours (2 Days)</option>
                  <option value="7d">7 Days (1 Week)</option>
                  <option value="30d">30 Days (1 Month)</option>
                  <option value="permanent">Permanent Ban</option>
                  <option value="custom">Custom Hours</option>
                </select>
              </div>

              {suspendDuration === 'custom' && (
                <div className="admin-form-group">
                  <label className="admin-label">Custom Hours</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="8760" 
                    className="admin-input" 
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="admin-form-group">
                <label className="admin-label">Reason for Suspension</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  placeholder="e.g. Autoclicker bot detected / Fake referrals"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setSelectedUserForSuspend(null)} 
                  className="admin-button"
                  disabled={submittingSuspend}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-button"
                  style={{ backgroundColor: '#da3633', color: '#fff', borderColor: '#da3633' }}
                  disabled={submittingSuspend}
                >
                  {submittingSuspend ? 'Suspending...' : 'Confirm Suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
