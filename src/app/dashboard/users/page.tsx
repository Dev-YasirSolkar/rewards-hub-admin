'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-client';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

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
            View users, manage accounts, and adjust points balances.
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
                <th>Action</th>
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
                users.map(user => (
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
                        background: user.status === 'suspended' ? '#da363320' : '#23863620',
                        color: user.status === 'suspended' ? '#f85149' : '#3fb950',
                      }}>
                        {user.status === 'suspended' 
                          ? (user.suspendedUntil ? '⏳ Temp Blocked' : '⛔ Perm Blocked') 
                          : 'Active'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#8b949e' }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td>
                      <Link 
                        href={`/dashboard/users/${user.id}`} 
                        style={{
                          background: '#21262d',
                          border: '1px solid #30363d',
                          color: '#58a6ff',
                          padding: '4px 12px',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

