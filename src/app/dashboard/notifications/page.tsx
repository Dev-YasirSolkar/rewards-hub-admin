'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';

interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  channel?: string;
  type?: string;
  badge?: string;
  link?: string;
  target?: string;
  sentCount?: any;
  status?: string;
  createdAt?: any;
}

export default function NotificationsPage() {
  const [history, setHistory] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<'in_app' | 'telegram' | 'both'>('in_app');
  const [type, setType] = useState<'announcement' | 'update' | 'reward' | 'event' | 'alert'>('announcement');
  const [badge, setBadge] = useState('');
  const [link, setLink] = useState('');
  const [target, setTarget] = useState('all');

  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await adminFetch<any>('/api/admin/notifications?refresh=true');
      if (res.success && res.data) {
        setHistory(Array.isArray(res.data) ? res.data : (res.data as any).notifications || []);
      }
    } catch (e) {
      console.error('Failed to fetch announcements:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter an announcement title');
      return;
    }
    if (!message.trim()) {
      alert('Please enter a message body');
      return;
    }

    setSending(true);
    try {
      const res = await adminFetch<any>('/api/admin/notifications', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          channel,
          type,
          badge: badge.trim() || undefined,
          link: link.trim() || undefined,
          target,
        }),
      });

      if (res.success) {
        if (channel === 'in_app') {
          alert('✅ In-App Announcement published successfully! Users will immediately see it in the Mini App.');
        } else {
          const count = res.sentCount ?? 0;
          alert(`✅ Broadcast complete! Delivered to ${count} user(s).`);
        }
        setTitle('');
        setMessage('');
        setBadge('');
        setLink('');
        fetchHistory();
      } else {
        alert(res.error || 'Failed to publish announcement');
      }
    } catch {
      alert('Network error while publishing announcement');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`Are you sure you want to delete the announcement "${itemTitle}"?`)) return;

    setDeletingId(id);
    try {
      const res = await adminFetch<any>(`/api/admin/notifications?id=${id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(res.error || 'Failed to delete announcement');
      }
    } catch {
      alert('Network error while deleting announcement');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* ── TOP PAGE HEADER ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 4px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📢</span> Announcements &amp; In-App News
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '13px' }}>
            Create in-app news cards for the Telegram Mini App or send direct bot broadcasts.
          </p>
        </div>
        <button onClick={fetchHistory} className="btn-3d-blue" style={{ fontSize: '12px', padding: '7px 16px' }}>
          ↻ Refresh Ledger
        </button>
      </div>

      {/* ── COMPOSE CARD ───────────────────────────────────────────────────── */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 16px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✍️</span> Compose New Announcement
        </h3>

        <form onSubmit={handleSend}>
          {/* Destination Channel Selector */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#fde047', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Publishing Destination
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: channel === 'in_app' ? 'rgba(56, 189, 248, 0.16)' : 'rgba(15, 23, 42, 0.6)',
                  border: channel === 'in_app' ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="channel"
                  value="in_app"
                  checked={channel === 'in_app'}
                  onChange={() => setChannel('in_app')}
                  style={{ accentColor: '#38bdf8' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: channel === 'in_app' ? '#38bdf8' : '#f8fafc' }}>
                    📱 In-App News Only
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Shows in Mini App Announcements screen (Recommended)
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: channel === 'telegram' ? 'rgba(245, 158, 11, 0.16)' : 'rgba(15, 23, 42, 0.6)',
                  border: channel === 'telegram' ? '1.5px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="channel"
                  value="telegram"
                  checked={channel === 'telegram'}
                  onChange={() => setChannel('telegram')}
                  style={{ accentColor: '#fbbf24' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: channel === 'telegram' ? '#fbbf24' : '#f8fafc' }}>
                    💬 Telegram Bot DM Only
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Sends private message to users from @YasirFestBot
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: channel === 'both' ? 'rgba(16, 185, 129, 0.16)' : 'rgba(15, 23, 42, 0.6)',
                  border: channel === 'both' ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="channel"
                  value="both"
                  checked={channel === 'both'}
                  onChange={() => setChannel('both')}
                  style={{ accentColor: '#10b981' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: channel === 'both' ? '#34d399' : '#f8fafc' }}>
                    🌐 Both (In-App + Telegram)
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Publishes in App and sends Telegram DM
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Title & Category Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>
                Announcement Title *
              </label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. 🚀 Weekend Double Points Event is Live!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>
                Category / Badge
              </label>
              <select
                className="admin-select"
                value={type}
                onChange={(e: any) => setType(e.target.value)}
              >
                <option value="announcement">📢 Official News</option>
                <option value="update">🚀 New Update / Feature</option>
                <option value="reward">🎁 Bonus Reward Drop</option>
                <option value="event">⚡ Special Event</option>
                <option value="alert">⚠️ System Notice / Alert</option>
              </select>
            </div>
          </div>

          {/* Optional Badge Text & Link Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>
                Custom Tag / Badge (Optional)
              </label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. 2X BOOST, AIRDROP, MAINTENANCE"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>
                Action Link (Optional)
              </label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. /mine, /tasks or https://t.me/..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          </div>

          {/* Message Body */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>
              Message Content *
            </label>
            <textarea
              className="admin-textarea"
              placeholder="Write the detailed announcement message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Audience and Submit Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>AUDIENCE:</span>
              <select
                className="admin-select"
                style={{ width: 'auto', minWidth: '160px' }}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="all">All Members</option>
                <option value="active">Active Members Only</option>
              </select>
            </div>

            <button type="submit" className="btn-3d-gold" disabled={sending} style={{ minWidth: '180px' }}>
              {sending ? 'Publishing...' : channel === 'in_app' ? '📱 Publish to Mini App' : '⚡ Send Broadcast Now'}
            </button>
          </div>
        </form>
      </div>

      {/* ── HISTORY LEDGER ─────────────────────────────────────────────────── */}
      <div className="admin-card">
        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📜</span> Announcements &amp; Broadcasts History
        </h3>

        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8' }}>
            <div className="skeleton-box" style={{ height: '38px', marginBottom: '8px' }} />
            <div className="skeleton-box" style={{ height: '38px', marginBottom: '8px' }} />
            <div className="skeleton-box" style={{ height: '38px' }} />
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Message Preview</th>
                  <th>Channel</th>
                  <th>Created Date &amp; Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      No announcements published yet.
                    </td>
                  </tr>
                ) : (
                  history.map((h) => {
                    const ch = h.channel || (h.sentCount === 'In-App Only' ? 'in_app' : 'telegram');
                    const badgeText = h.badge || h.type || 'Official';

                    return (
                      <tr key={h.id}>
                        <td>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: 'rgba(56, 189, 248, 0.15)',
                              color: '#38bdf8',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {badgeText}
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: '#f8fafc', minWidth: '160px' }}>
                          {h.title || 'Announcement'}
                        </td>
                        <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#94a3b8', fontSize: '13px' }}>
                          {h.message}
                        </td>
                        <td>
                          {ch === 'in_app' ? (
                            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 800 }}>
                              📱 In-App Only
                            </span>
                          ) : ch === 'telegram' ? (
                            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontWeight: 800 }}>
                              💬 Telegram DM
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 800 }}>
                              🌐 Both
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                          {h.createdAt
                            ? typeof h.createdAt === 'object' && h.createdAt._seconds
                              ? new Date(h.createdAt._seconds * 1000).toLocaleString()
                              : new Date(h.createdAt).toLocaleString()
                            : 'N/A'}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(h.id, h.title)}
                            disabled={deletingId === h.id}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.35)',
                              borderRadius: '8px',
                              color: '#ef4444',
                              padding: '5px 10px',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>🗑️</span>
                            <span>{deletingId === h.id ? 'Deleting...' : 'Delete'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
