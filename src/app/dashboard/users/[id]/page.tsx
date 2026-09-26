'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-client';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Adjust Balance modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  // Suspend modal
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendDuration, setSuspendDuration] = useState('24h');
  const [customHours, setCustomHours] = useState('48');
  const [suspendReason, setSuspendReason] = useState('');
  const [submittingSuspend, setSubmittingSuspend] = useState(false);

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await adminFetch(`/api/admin/users/${id}`);
      if (res.success && res.data) {
        const u = res.data.user || res.data;
        setUser(u);
        setTransactions(res.data.transactions || []);
        setReferrals(res.data.referrals || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleUnsuspend = async () => {
    if (!confirm('Reactivate this user account now?')) return;
    try {
      const res = await adminFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active' }),
      });
      if (res.success) {
        alert('User has been reactivated successfully!');
        fetchUser();
      } else {
        alert(res.error || 'Failed to reactivate user');
      }
    } catch (e) {
      console.error(e);
      alert('Error reactivating user');
    }
  };

  const handleSuspendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSuspend(true);
    try {
      const res = await adminFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'suspended',
          duration: suspendDuration,
          customHours: suspendDuration === 'custom' ? customHours : undefined,
          reason: suspendReason.trim() || 'Suspended by Administrator',
        }),
      });

      if (res.success) {
        alert(
          suspendDuration === 'permanent'
            ? 'User has been permanently suspended!'
            : `User suspended temporarily (${suspendDuration})!`
        );
        setShowSuspendModal(false);
        setSuspendReason('');
        fetchUser();
      } else {
        alert(res.error || 'Failed to suspend user');
      }
    } catch {
      alert('Network error while suspending user');
    } finally {
      setSubmittingSuspend(false);
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(adjustAmount, 10);
    if (!amountNum) {
      alert('Please enter a valid positive or negative amount');
      return;
    }
    if (!adjustReason.trim()) {
      alert('Please enter a reason for balance adjustment');
      return;
    }

    setSubmittingAdjust(true);
    try {
      const res = await adminFetch(`/api/admin/users/${id}/adjust-balance`, {
        method: 'POST',
        body: JSON.stringify({
          amount: amountNum,
          reason: adjustReason.trim(),
        }),
      });

      if (res.success) {
        alert(`Successfully adjusted balance by ${amountNum > 0 ? '+' : ''}${amountNum} pts!`);
        setShowAdjustModal(false);
        setAdjustAmount('');
        setAdjustReason('');
        fetchUser();
      } else {
        alert(res.error || 'Failed to adjust balance');
      }
    } catch {
      alert('Network error adjusting balance');
    } finally {
      setSubmittingAdjust(false);
    }
  };

  if (loading) return <div style={{ color: '#8b949e', padding: '20px' }}>Loading user details...</div>;
  if (!user) return <div style={{ color: '#f85149', padding: '20px' }}>User not found.</div>;

  const isSuspended = user.status === 'suspended';
  const hasExpiry = isSuspended && user.suspendedUntil;
  const expiryTime = hasExpiry ? new Date(user.suspendedUntil).getTime() : 0;
  const isExpired = hasExpiry && expiryTime <= Date.now();
  const remainingHours = hasExpiry ? Math.max(1, Math.ceil((expiryTime - Date.now()) / 3600_000)) : 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Link href="/dashboard/users" style={{ color: '#58a6ff', textDecoration: 'none', fontSize: '13px' }}>
          ← Back to Users
        </Link>
        <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#f0f6fc' }}>
          User: {user.firstName || 'User'} {user.lastName || ''}
        </h2>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h3 className="text-xl mb-4 font-semibold" style={{ margin: '0 0 16px', color: '#f0f6fc' }}>Account Profile</h3>
          <p><strong>User ID:</strong> <span style={{ fontFamily: 'monospace' }}>{user.id}</span></p>
          <p><strong>Telegram ID:</strong> <span style={{ fontFamily: 'monospace' }}>{user.telegramId || user.id}</span></p>
          <p><strong>Username:</strong> {user.username ? `@${user.username}` : 'N/A'}</p>
          
          <div style={{ margin: '12px 0', padding: '10px 12px', borderRadius: '8px', background: isSuspended ? '#3c1e22' : '#1b2d24', border: `1px solid ${isSuspended ? '#da3633' : '#238636'}` }}>
            <p style={{ margin: 0, fontWeight: 700, color: isSuspended ? '#f85149' : '#3fb950' }}>
              Status: {isSuspended ? (hasExpiry ? (isExpired ? '⏳ Expired (Will auto-lift)' : `⏳ Temporarily Suspended (~${remainingHours}h left)`) : '⛔ Permanently Suspended') : '✅ Active'}
            </p>
            {hasExpiry && !isExpired && (
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#c9d1d9' }}>
                Until: {new Date(user.suspendedUntil).toLocaleString()}
              </p>
            )}
            {isSuspended && user.suspendReason && (
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#ffa657' }}>
                Reason: {user.suspendReason}
              </p>
            )}
          </div>

          <p><strong>Referral Code:</strong> <span style={{ fontFamily: 'monospace' }}>{user.referralCode || 'N/A'}</span></p>
          
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {isSuspended ? (
              <button
                className="admin-button"
                onClick={handleUnsuspend}
                style={{ background: '#238636' }}
              >
                ✅ Unsuspend / Activate User
              </button>
            ) : (
              <button
                className="admin-button admin-button-danger"
                onClick={() => setShowSuspendModal(true)}
                style={{ background: '#da3633' }}
              >
                🚫 Block / Suspend User
              </button>
            )}
          </div>
        </div>

        <div className="admin-card">
          <h3 className="text-xl mb-4 font-semibold" style={{ margin: '0 0 16px', color: '#f0f6fc' }}>Wallet & Points</h3>
          <p style={{ color: '#8b949e', fontSize: '12px', margin: '0 0 4px' }}>Current Balance</p>
          <p style={{ color: '#FFD700', fontSize: '32px', fontWeight: 800, margin: '0 0 12px' }}>
            {(user.pointsBalance ?? user.balance ?? 0).toLocaleString()} pts
          </p>
          <p><strong>Lifetime Earned:</strong> {(user.lifetimeEarned || 0).toLocaleString()} pts</p>
          <p><strong>Lifetime Withdrawn:</strong> {(user.lifetimeWithdrawn || 0).toLocaleString()} pts</p>
          <button className="admin-button" onClick={() => setShowAdjustModal(true)} style={{ marginTop: '12px' }}>
            ± Adjust Balance
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="admin-card admin-table-container" style={{ marginTop: '20px' }}>
        <h3 className="text-xl mb-4 font-semibold" style={{ margin: '0 0 16px', color: '#f0f6fc' }}>Recent User Transactions</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#8b949e' }}>No transactions recorded.</td></tr>
            ) : (
              transactions.map((tx: any) => (
                <tr key={tx.id}>
                  <td style={{ fontWeight: 600 }}>{tx.type}</td>
                  <td style={{ color: tx.amount > 0 ? '#3fb950' : '#f85149', fontWeight: 700 }}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </td>
                  <td>{tx.description}</td>
                  <td style={{ fontSize: '12px', color: '#8b949e' }}>
                    {tx.createdAt
                      ? typeof tx.createdAt === 'object' && tx.createdAt._seconds
                        ? new Date(tx.createdAt._seconds * 1000).toLocaleDateString()
                        : new Date(tx.createdAt).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Suspend / Block Modal */}
      {showSuspendModal && (
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
              🚫 Block / Suspend User
            </h3>
            <p style={{ color: '#8b949e', fontSize: '13px', margin: '0 0 16px' }}>
              Choose whether to temporarily block or permanently ban this user.
            </p>

            <form onSubmit={handleSuspendSubmit}>
              <label style={{ fontSize: '13px', color: '#c9d1d9', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Duration (Block Time):
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
                <option value="permanent">⛔ Permanent Suspend (Hamesha ke liye Ban)</option>
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
                Reason for Suspension:
              </label>
              
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {[
                  'Fake Referrals / Self Referral',
                  'Task Spam / Botting',
                  'Excessive Reward Abuse',
                  'Violating Terms',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSuspendReason(preset)}
                    style={{
                      background: suspendReason === preset ? '#388bfd26' : '#21262d',
                      border: `1px solid ${suspendReason === preset ? '#388bfd' : '#30363d'}`,
                      color: suspendReason === preset ? '#58a6ff' : '#8b949e',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Reason note for user and audit log..."
                className="admin-input"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                style={{ marginBottom: '18px' }}
                required
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={submittingSuspend}
                  className="admin-button flex-1"
                  style={{ flex: 1, background: '#da3633' }}
                >
                  {submittingSuspend ? 'Suspending...' : 'Confirm Suspension'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSuspendModal(false)}
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

      {/* Adjust Balance Modal */}
      {showAdjustModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 100,
        }}>
          <div className="admin-card" style={{ maxWidth: '420px', width: '100%', margin: 0 }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 14px' }}>Adjust User Balance</h3>
            <form onSubmit={handleAdjust}>
              <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                Amount (Positive to add, Negative to deduct):
              </label>
              <input
                type="number"
                placeholder="e.g. 500 or -200"
                className="admin-input"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                style={{ marginBottom: '14px' }}
                required
              />

              <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                Reason / Note:
              </label>
              <input
                type="text"
                placeholder="Reason for adjustment (audit trail)"
                className="admin-input"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                style={{ marginBottom: '18px' }}
                required
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="admin-button flex-1"
                  style={{ flex: 1 }}
                >
                  {submittingAdjust ? 'Applying...' : 'Apply Adjustment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
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
