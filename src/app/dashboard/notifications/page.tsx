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
      <h2 className="text-2xl font-bold mb-6">Broadcast Notifications</h2>

      <div className="admin-card">
        <h3 className="text-xl mb-4">Send Broadcast</h3>
        <form onSubmit={handleSend}>
          <input
            type="text"
            className="admin-input"
            placeholder="Broadcast Title (e.g. Weekend Double Rewards!)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginBottom: '10px' }}
          />

          <textarea
            className="admin-input min-h-[100px]"
            placeholder="Enter message to broadcast to all Telegram bot users..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
            <select
              className="admin-input w-auto m-0"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
            </select>
            <button type="submit" className="admin-button" disabled={sending}>
              {sending ? 'Sending Broadcast...' : 'Send Broadcast'}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card admin-table-container">
        <h3 className="text-xl mb-4">Broadcast History</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Message</th>
                <th>Target</th>
                <th>Sent Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#8b949e' }}>
                    No broadcast history found.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600 }}>{h.title || 'Broadcast'}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {h.message}
                    </td>
                    <td style={{ textTransform: 'uppercase' }}>{h.target}</td>
                      <td style={{ fontSize: '12px', color: '#8b949e' }}>
                        {h.createdAt
                          ? typeof h.createdAt === 'object' && h.createdAt._seconds
                            ? new Date(h.createdAt._seconds * 1000).toLocaleString()
                            : new Date(h.createdAt).toLocaleString()
                          : 'N/A'}
                      </td>
                    <td>
                      <span style={{ color: '#3fb950', fontWeight: 600 }}>
                        {h.status || 'sent'}
                      </span>
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

