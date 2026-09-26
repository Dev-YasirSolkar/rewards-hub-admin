'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-client';

export default function FraudPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unresolved');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFlags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/fraud?status=${filter}`);
      if (res.success && res.data) {
        setFlags(Array.isArray(res.data) ? res.data : (res.data as any).flags || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleResolve = async (flagId: string) => {
    if (!confirm('Mark this fraud alert as resolved?')) return;
    setResolvingId(flagId);
    try {
      const res = await adminFetch('/api/admin/fraud', {
        method: 'PATCH',
        body: JSON.stringify({ flagId }),
      });
      if (res.success) {
        fetchFlags();
      } else {
        alert(res.error || 'Failed to resolve flag');
      }
    } catch {
      alert('Network error resolving flag');
    } finally {
      setResolvingId(null);
    }
  };

  const formatDate = (val: any) => {
    if (!val) return '—';
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? '—' : d.toLocaleString();
    } catch {
      return '—';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#f0f6fc' }}>Fraud Monitoring</h2>
          <p style={{ margin: '4px 0 0', color: '#8b949e', fontSize: '0.875rem' }}>
            System-detected anomalous behaviour, duplicate accounts, and reward abuse.
          </p>
        </div>
        <button onClick={fetchFlags} className="admin-button" style={{ padding: '6px 14px', fontSize: '13px' }}>
          ↻ Refresh
        </button>
      </div>

      <div className="admin-card" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ color: '#8b949e', fontSize: '0.875rem' }}>Status:</label>
        <select 
          className="admin-input"
          style={{ width: 'auto', minWidth: '150px', margin: 0 }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="unresolved">Unresolved Only</option>
          <option value="resolved">Resolved</option>
          <option value="all">All Flags</option>
        </select>
      </div>

      <div className="admin-card admin-table-container">
        {loading ? (
          <p style={{ color: '#8b949e', textAlign: 'center', padding: '20px' }}>Loading fraud flags...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Type</th>
                <th>User ID</th>
                <th>Description</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {flags.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#8b949e' }}>
                    No fraud flags recorded. System is running cleanly!
                  </td>
                </tr>
              ) : (
                flags.map(f => (
                  <tr key={f.id}>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: f.severity === 'high' || f.severity === 'critical' ? '#da363320' : f.severity === 'medium' ? '#d2992220' : '#1f6feb20',
                        color: f.severity === 'high' || f.severity === 'critical' ? '#f85149' : f.severity === 'medium' ? '#e3b341' : '#58a6ff',
                        border: `1px solid ${f.severity === 'high' || f.severity === 'critical' ? '#da3633' : f.severity === 'medium' ? '#d29922' : '#1f6feb'}`,
                      }}>
                        {f.severity || 'low'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#f0f6fc', textTransform: 'capitalize' }}>
                      {f.type?.replace(/_/g, ' ') || 'Flag'}
                    </td>
                    <td>
                      <Link href={`/dashboard/users/${f.userId}`} style={{ color: '#58a6ff', textDecoration: 'none', fontFamily: 'monospace' }}>
                        {f.userId}
                      </Link>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#c9d1d9', maxWidth: '300px' }}>
                      {f.description || f.reason || '—'}
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: f.resolved ? '#23863620' : '#da363320',
                        color: f.resolved ? '#3fb950' : '#f85149',
                      }}>
                        {f.resolved ? 'Resolved' : 'Active Alert'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#8b949e', whiteSpace: 'nowrap' }}>
                      {formatDate(f.createdAt)}
                    </td>
                    <td>
                      {!f.resolved && (
                        <button 
                          onClick={() => handleResolve(f.id)}
                          disabled={resolvingId === f.id}
                          className="admin-button"
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            background: '#238636',
                            cursor: 'pointer',
                          }}
                        >
                          {resolvingId === f.id ? 'Resolving...' : '✓ Resolve'}
                        </button>
                      )}
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

