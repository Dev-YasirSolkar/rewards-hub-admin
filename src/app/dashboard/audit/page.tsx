'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/audit?refresh=true');
      if (res.success && res.data) {
        setLogs(Array.isArray(res.data) ? res.data : (res.data as any).logs || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getActionBadge = (action: string) => {
    if (action.includes('delete') || action.includes('suspend') || action.includes('reject')) {
      return <span className="badge-rejected">{action}</span>;
    }
    if (action.includes('create') || action.includes('approve') || action.includes('update')) {
      return <span className="badge-success">{action}</span>;
    }
    if (action.includes('adjust') || action.includes('settings')) {
      return <span className="badge-gold">{action}</span>;
    }
    return <span className="badge-blue">{action}</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 4px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📜</span> Security & Operations Audit Trail
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '13px' }}>
            Immutable administrative event ledger tracking settings modifications, payouts, and user restrictions.
          </p>
        </div>
        <button className="btn-3d-blue" onClick={fetchLogs} style={{ padding: '6px 14px', fontSize: '12px' }}>
          ↻ Refresh Trail
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '20px 0' }}>
            <div className="skeleton-box" style={{ height: '38px', marginBottom: '8px' }} />
            <div className="skeleton-box" style={{ height: '38px', marginBottom: '8px' }} />
            <div className="skeleton-box" style={{ height: '38px', marginBottom: '8px' }} />
            <div className="skeleton-box" style={{ height: '38px' }} />
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event Action</th>
                  <th>Admin / Actor ID</th>
                  <th>Execution Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{getActionBadge(log.action || 'ACTION')}</td>
                      <td style={{ fontFamily: 'monospace', color: '#38bdf8', fontSize: '12px' }}>
                        {log.performedBy || log.adminId || 'SYSTEM_DAEMON'}
                      </td>
                      <td style={{ fontSize: '12px', maxWidth: '400px', wordBreak: 'break-all', color: '#94a3b8' }}>
                        {typeof log.details === 'object' ? (
                          <pre style={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '6px' }}>
                            {JSON.stringify(log.details, null, 1)}
                          </pre>
                        ) : (
                          String(log.details || '—')
                        )}
                      </td>
                      <td style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {log.createdAt
                          ? typeof log.createdAt === 'object' && log.createdAt._seconds
                            ? new Date(log.createdAt._seconds * 1000).toLocaleString()
                            : new Date(log.createdAt).toLocaleString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
