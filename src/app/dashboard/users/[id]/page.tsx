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
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await adminFetch(`/api/admin/users/${encodeURIComponent(id)}`);
      if (res.success && res.data) {
        const u = res.data.user || res.data;
        setUser(u);
        setTransactions(res.data.transactions || []);
        setReferrals(res.data.referrals || []);
        setWithdrawals(res.data.withdrawals || []);
      } else {
        setErrorMsg(res.error || 'User not found in system');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Network error while fetching user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    if (!confirm('Reactivate this user account now?')) return;
    try {
      const res = await adminFetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active' }),
      });
      if (res.success) {
        alert('User has been reactivated successfully');
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
      const res = await adminFetch(`/api/admin/users/${encodeURIComponent(id)}`, {
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
            ? 'User has been permanently suspended'
            : `User suspended temporarily (${suspendDuration})`
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
      const res = await adminFetch(`/api/admin/users/${encodeURIComponent(id)}/adjust-balance`, {
        method: 'POST',
        body: JSON.stringify({
          amount: amountNum,
          reason: adjustReason.trim(),
        }),
      });

      if (res.success) {
        alert(`Successfully adjusted balance by ${amountNum > 0 ? '+' : ''}${amountNum} pts`);
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

  if (loading) return <div style={{ color: '#8b949e', padding: '24px' }}>Loading user details...</div>;

  if (errorMsg || !user) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Link href="/dashboard/users" style={{ color: '#58a6ff', textDecoration: 'none', fontSize: '13px' }}>
            ← Back to Users
          </Link>
        </div>
        <div className="admin-card" style={{ border: '1px solid #da363350', padding: '24px', textAlign: 'center' }}>
          <h3 style={{ color: '#f85149', margin: '0 0 8px' }}>User Not Found</h3>
          <p style={{ color: '#8b949e', fontSize: '13px', margin: '0 0 16px' }}>
            {errorMsg || `Could not find any user with ID "${id}".`}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={fetchUser} className="admin-button" style={{ padding: '8px 18px', fontSize: '13px' }}>
              Retry
            </button>
            <Link href="/dashboard/users" className="admin-button" style={{ padding: '8px 18px', fontSize: '13px', textDecoration: 'none', background: '#21262d' }}>
              View All Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Account Profile Card */}
        <div className="admin-card">
          <h3 style={{ margin: '0 0 16px', color: '#f0f6fc', fontSize: '16px', fontWeight: 700 }}>
            Account Profile
          </h3>
          <p style={{ margin: '6px 0', fontSize: '13px' }}>
            <strong style={{ color: '#8b949e' }}>User ID:</strong> <span style={{ fontFamily: 'monospace', color: '#f0f6fc' }}>{user.id}</span>
          </p>
          <p style={{ margin: '6px 0', fontSize: '13px' }}>
            <strong style={{ color: '#8b949e' }}>Telegram ID:</strong> <span style={{ fontFamily: 'monospace', color: '#f0f6fc' }}>{user.telegramId || user.id}</span>
          </p>
          <p style={{ margin: '6px 0', fontSize: '13px' }}>
            <strong style={{ color: '#8b949e' }}>Username:</strong> <span style={{ color: '#58a6ff' }}>{user.username ? `@${user.username}` : 'N/A'}</span>
          </p>
          
          <div style={{
            margin: '14px 0',
            padding: '10px 12px',
            borderRadius: '8px',
            background: isSuspended && !isExpired ? '#3c1e22' : '#1b2d24',
            border: `1px solid ${isSuspended && !isExpired ? '#da3633' : '#238636'}`,
          }}>
            <p style={{ margin: 0, fontWeight: 700, color: isSuspended && !isExpired ? '#f85149' : '#3fb950', fontSize: '13px' }}>
              Status: {isSuspended && !isExpired
                ? (hasExpiry ? `Temporarily Suspended (~${remainingHours}h remaining)` : 'Permanently Suspended')
                : 'Active'}
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

          <p style={{ margin: '6px 0', fontSize: '13px' }}>
            <strong style={{ color: '#8b949e' }}>Referral Code:</strong> <span style={{ fontFamily: 'monospace', color: '#f0f6fc' }}>{user.referralCode || 'N/A'}</span>
          </p>
          <p style={{ margin: '6px 0', fontSize: '13px' }}>
            <strong style={{ color: '#8b949e' }}>Referrals Count:</strong> <span style={{ color: '#f0f6fc', fontWeight: 600 }}>{user.referralCount || 0}</span>
          </p>
          
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {isSuspended && !isExpired ? (
              <button
                className="admin-button"
                onClick={handleUnsuspend}
                style={{ background: '#238636', fontSize: '13px' }}
              >
                Unsuspend / Reactivate User
              </button>
            ) : (
              <button
                className="admin-button admin-button-danger"
                onClick={() => setShowSuspendModal(true)}
                style={{ background: '#da3633', fontSize: '13px' }}
              >
                Block / Suspend User
              </button>
            )}
          </div>
        </div>

        {/* Wallet & Payout Method Card */}
        <div className="admin-card">
          <h3 style={{ margin: '0 0 16px', color: '#f0f6fc', fontSize: '16px', fontWeight: 700 }}>
            Wallet & Saved Payout Details
          </h3>
          <p style={{ color: '#8b949e', fontSize: '12px', margin: '0 0 4px' }}>Points Balance</p>
          <p style={{ color: '#FFD700', fontSize: '30px', fontWeight: 800, margin: '0 0 12px' }}>
            {(user.pointsBalance ?? user.balance ?? 0).toLocaleString()} pts
          </p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>
            <strong style={{ color: '#8b949e' }}>Lifetime Earned:</strong> {(user.lifetimeEarned || 0).toLocaleString()} pts
          </p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>
            <strong style={{ color: '#8b949e' }}>Lifetime Withdrawn:</strong> {(user.lifetimeWithdrawn || 0).toLocaleString()} pts
          </p>

          {/* Saved Payout Information */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '8px',
            background: '#0b0e14',
            border: '1px solid #30363d',
          }}>
            <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#58a6ff' }}>
              Default Payout Account:
            </p>
            {user.defaultPayoutMethod === 'upi' ? (
              <div>
                <span style={{ fontSize: '11px', color: '#8b949e' }}>UPI ID: </span>
                <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#f0f6fc', fontWeight: 600 }}>
                  {user.savedUpiId || 'Not provided'}
                </span>
              </div>
            ) : user.defaultPayoutMethod === 'bank_transfer' && user.savedBankDetails ? (
              <div style={{ fontSize: '12px', color: '#f0f6fc', lineHeight: 1.5 }}>
                <div><span style={{ color: '#8b949e' }}>Name:</span> {user.savedBankDetails.accountName}</div>
                <div><span style={{ color: '#8b949e' }}>A/C:</span> <span style={{ fontFamily: 'monospace' }}>{user.savedBankDetails.accountNumber}</span></div>
                <div><span style={{ color: '#8b949e' }}>IFSC:</span> <span style={{ fontFamily: 'monospace' }}>{user.savedBankDetails.ifscCode}</span></div>
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: '#8b949e' }}>No default payout method saved yet</span>
            )}
          </div>

          <button className="admin-button" onClick={() => setShowAdjustModal(true)} style={{ marginTop: '16px', fontSize: '13px' }}>
            Adjust Balance
          </button>
        </div>
      </div>

      {/* User Withdrawal Requests */}
      <div className="admin-card admin-table-container" style={{ marginTop: '20px' }}>
        <h3 style={{ margin: '0 0 16px', color: '#f0f6fc', fontSize: '16px', fontWeight: 700 }}>
          User Withdrawal History
        </h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#8b949e', padding: '16px' }}>No withdrawals recorded for this user.</td></tr>
            ) : (
              withdrawals.map((w: any) => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 700, color: '#f59e0b' }}>{w.amount?.toLocaleString()} pts</td>
                  <td style={{ textTransform: 'uppercase', fontSize: '11px' }}>{w.method}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: w.status === 'success' || w.status === 'paid' ? '#23863620' : w.status === 'processing' || w.status === 'approved' ? '#1f6feb20' : w.status === 'rejected' ? '#da363320' : '#d2992220',
                      color: w.status === 'success' || w.status === 'paid' ? '#3fb950' : w.status === 'processing' || w.status === 'approved' ? '#58a6ff' : w.status === 'rejected' ? '#f85149' : '#d29922',
                    }}>
                      {w.status === 'success' || w.status === 'paid' ? 'Success' : w.status === 'processing' || w.status === 'approved' ? 'Processing' : w.status === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#8b949e' }}>
                    {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Transactions */}
      <div className="admin-card admin-table-container" style={{ marginTop: '20px' }}>
        <h3 style={{ margin: '0 0 16px', color: '#f0f6fc', fontSize: '16px', fontWeight: 700 }}>
          Recent Point Transactions
        </h3>
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
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#8b949e', padding: '16px' }}>No transactions recorded.</td></tr>
            ) : (
              transactions.map((tx: any) => (
                <tr key={tx.id}>
                  <td style={{ fontWeight: 600 }}>{tx.type}</td>
                  <td style={{ color: tx.amount > 0 ? '#3fb950' : '#f85149', fontWeight: 700 }}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </td>
                  <td>{tx.description}</td>
                  <td style={{ fontSize: '12px', color: '#8b949e' }}>
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Suspend User Modal */}
      {showSuspendModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '16px', backdropFilter: 'blur(3px)',
        }}>
          <div className="admin-card" style={{ maxWidth: '440px', width: '100%', border: '1px solid #da363350' }}>
            <h3 style={{ margin: '0 0 12px', color: '#f85149', fontSize: '18px' }}>
              Block / Suspend User
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#8b949e' }}>
              User: <strong style={{ color: '#f0f6fc' }}>{user.firstName}</strong> ({user.telegramId || user.id})
            </p>

            <form onSubmit={handleSuspendSubmit}>
              <label style={{ fontSize: '12px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                Suspension Duration
              </label>
              <select
                className="admin-input"
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(e.target.value)}
                style={{ width: '100%', marginBottom: '12px' }}
              >
                <option value="1h">1 Hour (Quick Warning)</option>
                <option value="24h">24 Hours (1 Day)</option>
                <option value="3d">3 Days</option>
                <option value="7d">7 Days (1 Week)</option>
                <option value="30d">30 Days (1 Month)</option>
                <option value="custom">Custom Hours</option>
                <option value="permanent">Permanent Ban</option>
              </select>

              {suspendDuration === 'custom' && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                    Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8760"
                    className="admin-input"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              <label style={{ fontSize: '12px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                Reason (Shown to User)
              </label>
              <textarea
                className="admin-input"
                rows={3}
                placeholder="Reason for suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                style={{ width: '100%', resize: 'vertical', marginBottom: '18px' }}
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowSuspendModal(false)}
                  disabled={submittingSuspend}
                  style={{
                    background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9',
                    padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSuspend}
                  style={{
                    background: '#da3633', border: 'none', color: '#fff',
                    padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  }}
                >
                  {submittingSuspend ? 'Suspending...' : 'Confirm Suspend'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {showAdjustModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '16px', backdropFilter: 'blur(3px)',
        }}>
          <div className="admin-card" style={{ maxWidth: '420px', width: '100%' }}>
            <h3 style={{ margin: '0 0 12px', color: '#f0f6fc', fontSize: '18px' }}>
              Adjust User Balance
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#8b949e' }}>
              Current: <strong style={{ color: '#FFD700' }}>{(user.pointsBalance ?? user.balance ?? 0).toLocaleString()} pts</strong>
            </p>

            <form onSubmit={handleAdjust}>
              <label style={{ fontSize: '12px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                Adjustment Amount (use negative for deduction)
              </label>
              <input
                type="number"
                placeholder="e.g. 500 or -200"
                className="admin-input"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                style={{ width: '100%', marginBottom: '12px' }}
              />

              <label style={{ fontSize: '12px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                Reason for Adjustment
              </label>
              <input
                type="text"
                placeholder="e.g. Manual correction, bonus grant..."
                className="admin-input"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                style={{ width: '100%', marginBottom: '18px' }}
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  disabled={submittingAdjust}
                  style={{
                    background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9',
                    padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="admin-button"
                  style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600 }}
                >
                  {submittingAdjust ? 'Saving...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
