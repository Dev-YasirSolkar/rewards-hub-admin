'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-client';

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
      const res = await adminFetch(`/api/admin/users?status=${status}&search=${encodeURIComponent(search)}`);
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#f0f6fc' }}>User Management</h2>
          <p style={{ margin: '4px 0 0', color: '#8b949e', fontSize: '0.875rem' }}>
            View users, manage accounts, block/unblock, and adjust points balances.
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
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <button type="submit" className="admin-button">Search</button>
      </form>

      <div className="admin-card admin-table-container">
        {loading ? (
          <p style={{ color: '#8b949e', textAlign: 'center', padding: '20px' }}>Loading users...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Telegram ID</th>
                <th>Points Balance</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#8b949e' }}>
                    No users found matching your query.
                  </td>
                </tr>
              ) : (
                users.map(user => {
                  const isSuspended = user.status === 'suspended';
                  const hasExpiry = isSuspended && user.suspendedUntil;
                  const isExpired = hasExpiry && new Date(user.suspendedUntil).getTime() <= Date.now();

                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f0f6fc' }}>
                          {user.firstName} {user.lastName || ''}
                        </div>
                        {user.username && (
                          <div style={{ fontSize: '0.8rem', color: '#58a6ff' }}>
                            @{user.username}
                          </div>
                        )}
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#8b949e' }}>
                        {user.telegramId || user.id}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#e3b341' }}>
                          {(user.pointsBalance ?? user.balance ?? 0).toLocaleString()} pts
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
                            ? (user.suspendedUntil ? 'Temp Blocked' : 'Perm Blocked') 
                            : 'Active'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#8b949e' }}>
                        {formatDate(user.createdAt)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {isSuspended && !isExpired ? (
                            <button
                              onClick={() => handleUnblock(user)}
                              style={{
                                background: '#23863620',
                                border: '1px solid #23863650',
                                color: '#3fb950',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenBlockModal(user)}
                              style={{
                                background: '#da363315',
                                border: '1px solid #da363340',
                                color: '#f85149',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Block
                            </button>
                          )}

                          <Link 
                            href={`/dashboard/users/${user.id}`} 
                            style={{
                              background: '#21262d',
                              border: '1px solid #30363d',
                              color: '#58a6ff',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Manage →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Block / Suspend User Modal */}
      {selectedUserForSuspend && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '16px', backdropFilter: 'blur(3px)',
        }}>
          <div className="admin-card" style={{ maxWidth: '460px', width: '100%', margin: 0, border: '1px solid #da363350' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#f85149' }}>
              Block / Suspend User
            </h3>
            <p style={{ margin: '0 0 16px', color: '#8b949e', fontSize: '13px' }}>
              User: <strong style={{ color: '#f0f6fc' }}>{selectedUserForSuspend.firstName} {selectedUserForSuspend.lastName || ''}</strong> ({selectedUserForSuspend.telegramId || selectedUserForSuspend.id})
            </p>

            <form onSubmit={handleBlockSubmit}>
              <label style={{ fontSize: '12px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                Suspension Duration
              </label>
              <select
                className="admin-input"
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(e.target.value)}
                style={{ width: '100%', marginBottom: '12px' }}
              >
                <option value="1h">1 Hour (Quick Warning)</option>
                <option value="24h">24 Hours (1 Day)</option>
                <option value="3d">3 Days</option>
                <option value="7d">7 Days (1 Week)</option>
                <option value="30d">30 Days (1 Month)</option>
                <option value="custom">Custom Hours</option>
                <option value="permanent">Permanent Ban</option>
              </select>

              {suspendDuration === 'custom' && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                    Number of Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8760"
                    className="admin-input"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              <label style={{ fontSize: '12px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                Reason (Shown to User)
              </label>
              <textarea
                className="admin-input"
                rows={3}
                placeholder="e.g. Multiple fake referrals detected, suspicious bot activity..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                style={{ width: '100%', resize: 'vertical', marginBottom: '18px' }}
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedUserForSuspend(null)}
                  disabled={submittingSuspend}
                  style={{
                    background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9',
                    padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSuspend}
                  style={{
                    background: '#da3633', border: 'none', color: '#fff',
                    padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  }}
                >
                  {submittingSuspend ? 'Blocking...' : 'Confirm Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
