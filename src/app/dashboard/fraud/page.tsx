'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-client';

export default function FraudPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unresolved');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Suspend modal state
  const [selectedFlagForBlock, setSelectedFlagForBlock] = useState<any | null>(null);
  const [suspendDuration, setSuspendDuration] = useState('24h');
  const [customHours, setCustomHours] = useState('48');
  const [suspendReason, setSuspendReason] = useState('');
  const [submittingBlock, setSubmittingBlock] = useState(false);

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

  const openBlockModal = (flag: any) => {
    setSelectedFlagForBlock(flag);
    setSuspendReason(flag.description || `Fraud alert: ${flag.type || 'Suspicious activity'}`);
    setSuspendDuration('24h');
  };

  const handleConfirmBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlagForBlock) return;

    setSubmittingBlock(true);
    try {
      const res = await adminFetch('/api/admin/fraud', {
        method: 'PATCH',
        body: JSON.stringify({
          flagId: selectedFlagForBlock.id,
          suspendUser: true,
          userId: selectedFlagForBlock.userId,
          duration: suspendDuration,
          customHours: suspendDuration === 'custom' ? customHours : undefined,
          reason: suspendReason.trim() || 'Suspended due to fraud flag',
        }),
      });

      if (res.success) {
        alert(
          suspendDuration === 'permanent'
            ? 'User permanently blocked and flag resolved!'
            : `User temporarily blocked (${suspendDuration}) and flag resolved!`
        );
        setSelectedFlagForBlock(null);
        fetchFlags();
      } else {
        alert(res.error || 'Failed to block user');
      }
    } catch {
      alert('Network error while blocking user');
    } finally {
      setSubmittingBlock(false);
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
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => openBlockModal(f)}
                            className="admin-button"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              background: '#da3633',
                              cursor: 'pointer',
                            }}
                          >
                            🚫 Block User
                          </button>
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
                            {resolvingId === f.id ? '...' : '✓ Resolve'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Block & Suspend User Modal */}
      {selectedFlagForBlock && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 100,
        }}>
          <div className="admin-card" style={{ maxWidth: '460px', width: '100%', margin: 0, border: '1px solid #da3633' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 10px', color: '#f85149' }}>
              🚫 Block Abusing User
            </h3>
            <p style={{ color: '#8b949e', fontSize: '13px', margin: '0 0 16px' }}>
              Target User ID: <strong style={{ color: '#f0f6fc', fontFamily: 'monospace' }}>{selectedFlagForBlock.userId}</strong>
            </p>

            <form onSubmit={handleConfirmBlock}>
              <label style={{ fontSize: '13px', color: '#c9d1d9', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Block Duration:
              </label>
              <select
                className="admin-input"
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(e.target.value)}
                style={{ marginBottom: '14px' }}
              >
                <option value="1h">⏳ 1 Hour (1 Ghanta)</option>
                <option value="24h">⏳ 24 Hours / 1 Day (1 Din)</option>
                <option value="3d">⏳ 3 Days (3 Din)</option>
                <option value="7d">⏳ 7 Days / 1 Week (1 Hafta)</option>
                <option value="30d">⏳ 30 Days / 1 Month (1 Mahina)</option>
                <option value="custom">⏳ Custom Hours...</option>
                <option value="permanent">⛔ Permanent Ban (Hamesha ke liye Block)</option>
              </select>

              {suspendDuration === 'custom' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                    Enter Number of Hours:
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="admin-input"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    required
                  />
                </div>
              )}

              <label style={{ fontSize: '13px', color: '#c9d1d9', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Reason Note:
              </label>
              <input
                type="text"
                placeholder="Reason for suspension..."
                className="admin-input"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                style={{ marginBottom: '18px' }}
                required
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={submittingBlock}
                  className="admin-button flex-1"
                  style={{ flex: 1, background: '#da3633' }}
                >
                  {submittingBlock ? 'Blocking...' : 'Block & Resolve Alert'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFlagForBlock(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: '#21262d',
                    border: '1px solid #30363d',
                    color: '#c9d1d9',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
