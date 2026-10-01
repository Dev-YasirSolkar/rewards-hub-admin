'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';

interface AffiliateCampaign {
  id: string;
  name: string;
  description?: string;
  targetUrl?: string;
  reward: number;
  clicks?: number;
  conversions?: number;
  active: boolean;
}

export default function AffiliatesPage() {
  const [campaigns, setCampaigns] = useState<AffiliateCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AffiliateCampaign | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [reward, setReward] = useState('50');
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/affiliates');
      if (res.success && res.data) {
        setCampaigns(Array.isArray(res.data) ? res.data : (res.data as any).campaigns || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingCampaign(null);
    setName('');
    setDescription('');
    setTargetUrl('');
    setReward('50');
    setActive(true);
    setMessage(null);
    setShowModal(true);
  };

  const openEditModal = (c: AffiliateCampaign) => {
    setEditingCampaign(c);
    setName(c.name || '');
    setDescription(c.description || '');
    setTargetUrl(c.targetUrl || '');
    setReward(c.reward?.toString() || '50');
    setActive(c.active ?? true);
    setMessage(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Campaign name is required' });
      return;
    }

    const rewardNum = parseInt(reward, 10);
    if (isNaN(rewardNum) || rewardNum <= 0) {
      setMessage({ type: 'error', text: 'Reward points must be positive' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      targetUrl: targetUrl.trim(),
      reward: rewardNum,
      active,
    };

    try {
      let res;
      if (editingCampaign) {
        res = await adminFetch(`/api/admin/affiliates/${editingCampaign.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        res = await adminFetch('/api/admin/affiliates', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.success) {
        setShowModal(false);
        fetchCampaigns();
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to save campaign' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error saving campaign' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (c: AffiliateCampaign) => {
    try {
      const res = await adminFetch(`/api/admin/affiliates/${c.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !c.active }),
      });
      if (res.success) {
        setCampaigns(campaigns.map(item => item.id === c.id ? { ...item, active: !c.active } : item));
      } else {
        alert(res.error || 'Failed to toggle status');
      }
    } catch {
      alert('Network error updating campaign');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this affiliate campaign?')) return;
    try {
      const res = await adminFetch(`/api/admin/affiliates/${id}`, { method: 'DELETE' });
      if (res.success) {
        fetchCampaigns();
      } else {
        alert(res.error || 'Failed to delete campaign');
      }
    } catch {
      alert('Network error deleting campaign');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#f0f6fc' }}>Affiliate Campaigns</h2>
          <p style={{ margin: '4px 0 0', color: '#8b949e', fontSize: '0.875rem' }}>
            Set up external brand partner deals and track clicks and verified conversions.
          </p>
        </div>
        <button onClick={openCreateModal} className="admin-button">
          + Create Campaign
        </button>
      </div>

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
                <th>Campaign</th>
                <th>Target URL</th>
                <th>Reward</th>
                <th>Clicks</th>
                <th>Conversions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#8b949e' }}>
                    No affiliate campaigns created yet. Click &quot;+ Create Campaign&quot; to add one.
                  </td>
                </tr>
              ) : (
                campaigns.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f0f6fc' }}>{c.name}</div>
                      {c.description && (
                        <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '2px', maxWidth: '250px' }}>
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td>
                      {c.targetUrl ? (
                        <a
                          href={c.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#58a6ff', fontSize: '0.8rem', textDecoration: 'none', maxWidth: '160px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {c.targetUrl}
                        </a>
                      ) : (
                        <span style={{ color: '#484f58', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: '#e3b341', fontWeight: 600 }}>+{c.reward} pts</span>
                    </td>
                    <td>{c.clicks || 0}</td>
                    <td>{c.conversions || 0}</td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(c)}
                        title="Click to toggle status"
                        style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: 'none',
                          background: c.active ? '#23863620' : '#da363320',
                          color: c.active ? '#3fb950' : '#f85149',
                        }}
                      >
                        {c.active ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(c)}
                          style={{
                            background: '#21262d',
                            border: '1px solid #30363d',
                            color: '#58a6ff',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          style={{
                            background: '#21262d',
                            border: '1px solid #da3633',
                            color: '#f85149',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div style={{
            background: '#161a22',
            border: '1px solid #30363d',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '480px',
            padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: '#f0f6fc' }}>
                {editingCampaign ? 'Edit Campaign' : 'Create Affiliate Campaign'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {message && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                background: message.type === 'error' ? '#da363320' : '#23863620',
                color: message.type === 'error' ? '#f85149' : '#3fb950',
                border: `1px solid ${message.type === 'error' ? '#da3633' : '#238636'}`,
              }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Binance Registration Partner"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="admin-input"
                  style={{ marginBottom: 0 }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  placeholder="Offer details..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="admin-input"
                  style={{ marginBottom: 0, minHeight: '60px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                    Reward (pts) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={reward}
                    onChange={e => setReward(e.target.value)}
                    className="admin-input"
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#c9d1d9', fontSize: '0.875rem' }}>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={e => setActive(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    Active
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>
                  Target Affiliate Link
                </label>
                <input
                  type="url"
                  placeholder="https://partner-link.com"
                  value={targetUrl}
                  onChange={e => setTargetUrl(e.target.value)}
                  className="admin-input"
                  style={{ marginBottom: 0 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: '#21262d',
                    border: '1px solid #30363d',
                    color: '#c9d1d9',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-button"
                  style={{ opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Saving...' : editingCampaign ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

