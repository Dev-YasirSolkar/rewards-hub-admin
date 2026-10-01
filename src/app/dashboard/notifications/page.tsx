'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';

export default function NotificationsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/notifications');
      if (res.success && res.data) {
        setHistory(Array.isArray(res.data) ? res.data : (res.data as any).notifications || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const res = await adminFetch('/api/admin/notifications', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim() || 'Important Announcement',
          message: message.trim(),
          target,
        }),
      });

      if (res.success) {
        alert('Broadcast sent successfully!');
        setTitle('');
        setMessage('');
        fetchHistory();
      } else {
        alert(res.error || 'Failed to send broadcast');
      }
    } catch {
      alert('Network error while broadcasting');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 4px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📢</span> Broadcast Notifications
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '13px' }}>
            Transmit live announcements and event notifications directly to Telegram users.
          </p>
        </div>
        <button onClick={fetchHistory} className="btn-3d-blue" style={{ fontSize: '12px', padding: '6px 14px' }}>
          ↻ Refresh Ledger
        </button>
      </div>

      <div className="admin-card">
        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>✉️</span> Compose Broadcast Message
        </h3>
        <form onSubmit={handleSend}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>
              Broadcast Title
            </label>
            <input
              type="text"
              className="admin-input"
              placeholder="e.g. 🚀 Weekend Double Rewards & New Mining Boost!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>
              Message Body (HTML Supported)
            </label>
            <textarea
              className="admin-textarea"
              placeholder="Enter message text to broadcast to users..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>RECIPIENTS:</span>
              <select
                className="admin-select"
                style={{ width: 'auto', minWidth: '150px' }}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="all">All Members</option>
                <option value="active">Active Members Only</option>
              </select>
            </div>
            <button type="submit" className="btn-3d-gold" disabled={sending}>
              {sending ? 'Broadcasting...' : '⚡ Send Broadcast Now'}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 14px', color: '#fff' }}>
          Broadcast History
        </h3>
        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8' }}>
            <div className="skeleton-box" style={{ height: '36px', marginBottom: '8px' }} />
            <div className="skeleton-box" style={{ height: '36px', marginBottom: '8px' }} />
            <div className="skeleton-box" style={{ height: '36px' }} />
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Message Preview</th>
                  <th>Target</th>
                  <th>Sent Date</th>
                  <th>Delivered</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                      No broadcasts have been sent yet.
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 700, color: '#f8fafc' }}>{h.title || 'Broadcast'}</td>
                      <td style={{ maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#94a3b8', fontSize: '13px' }}>
                        {h.message}
                      </td>
                      <td>
                        <span className="badge-blue">{h.target}</span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {h.createdAt
                          ? typeof h.createdAt === 'object' && h.createdAt._seconds
                            ? new Date(h.createdAt._seconds * 1000).toLocaleString()
                            : new Date(h.createdAt).toLocaleString()
                          : 'N/A'}
                      </td>
                      <td style={{ fontWeight: 800, color: '#38bdf8' }}>
                        {h.sentCount !== undefined ? h.sentCount : '—'}
                      </td>
                      <td>
                        <span className="badge-success">
                          {h.status || 'SENT'}
                        </span>
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
