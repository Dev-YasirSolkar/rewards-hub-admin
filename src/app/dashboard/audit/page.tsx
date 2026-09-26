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
      const res = await adminFetch('/api/admin/audit');
      if (res.success && res.data) {
        setLogs(Array.isArray(res.data) ? res.data : (res.data as any).logs || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Audit Logs</h2>
        <button className="admin-button" onClick={fetchLogs} style={{ padding: '6px 14px', fontSize: '13px' }}>
          ↻ Refresh
        </button>
      </div>

      <div className="admin-card admin-table-container">
        {loading ? (
          <p>Loading logs...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Admin / Actor</th>
                <th>Details</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#8b949e' }}>
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600, color: '#58a6ff' }}>{log.action}</td>
                    <td style={{ fontFamily: 'monospace' }}>{log.performedBy || log.adminId || 'System'}</td>
                    <td style={{ fontSize: '13px', maxWidth: '350px', wordBreak: 'break-all' }}>
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '—')}
                    </td>
                    <td style={{ fontSize: '12px', color: '#8b949e' }}>
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
        )}
      </div>
    </div>
  );
}

