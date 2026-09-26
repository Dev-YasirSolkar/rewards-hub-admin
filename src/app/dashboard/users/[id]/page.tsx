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
  const [showModal, setShowModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const toggleSuspend = async () => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    if (!confirm(`Are you sure you want to mark this user as ${nextStatus}?`)) return;

    try {
      const res = await adminFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.success) {
        fetchUser();
      } else {
        alert(res.error || 'Failed to update status');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating user status');
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

    setSubmitting(true);
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
        setShowModal(false);
        setAdjustAmount('');
        setAdjustReason('');
        fetchUser();
      } else {
        alert(res.error || 'Failed to adjust balance');
      }
    } catch {
      alert('Network error adjusting balance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ color: '#8b949e', padding: '20px' }}>Loading user details...</div>;
  if (!user) return <div style={{ color: '#f85149', padding: '20px' }}>User not found.</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Link href="/dashboard/users" style={{ color: '#58a6ff', textDecoration: 'none', fontSize: '13px' }}>
          ← Back to Users
        </Link>
        <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
          User: {user.firstName || 'User'} {user.lastName || ''}
        </h2>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h3 className="text-xl mb-4 font-semibold">Account Profile</h3>
          <p><strong>User ID:</strong> <span style={{ fontFamily: 'monospace' }}>{user.id}</span></p>
          <p><strong>Telegram ID:</strong> <span style={{ fontFamily: 'monospace' }}>{user.telegramId || user.id}</span></p>
          <p><strong>Username:</strong> {user.username ? `@${user.username}` : 'N/A'}</p>
          <p><strong>Status:</strong> <span style={{ color: user.status === 'active' ? '#3fb950' : '#f85149', fontWeight: 700 }}>{user.status}</span></p>
          <p><strong>Referral Code:</strong> <span style={{ fontFamily: 'monospace' }}>{user.referralCode || 'N/A'}</span></p>
          <div className="mt-4 flex gap-2">
            <button
              className={`admin-button ${user.status === 'suspended' ? '' : 'admin-button-danger'}`}
              onClick={toggleSuspend}
              style={{
                background: user.status === 'suspended' ? '#238636' : '#da3633',
              }}
            >
              {user.status === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
            </button>
          </div>
        </div>

        <div className="admin-card">
          <h3 className="text-xl mb-4 font-semibold">Wallet & Points</h3>
          <p style={{ color: '#8b949e', fontSize: '12px', margin: '0 0 4px' }}>Current Balance</p>
          <p className="text-3xl font-bold text-yellow-500 mb-4" style={{ color: '#FFD700', fontSize: '32px', fontWeight: 800, margin: '0 0 12px' }}>
            {(user.pointsBalance ?? user.balance ?? 0).toLocaleString()} pts
          </p>
          <p><strong>Lifetime Earned:</strong> {(user.lifetimeEarned || 0).toLocaleString()} pts</p>
          <p><strong>Lifetime Withdrawn:</strong> {(user.lifetimeWithdrawn || 0).toLocaleString()} pts</p>
          <button className="admin-button" onClick={() => setShowModal(true)} style={{ marginTop: '12px' }}>
            ± Adjust Balance
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="admin-card admin-table-container">
        <h3 className="text-xl mb-4 font-semibold">Recent User Transactions</h3>
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

      {/* Adjust Balance Modal */}
      {showModal && (
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
                  disabled={submitting}
                  className="admin-button flex-1"
                  style={{ flex: 1 }}
                >
                  {submitting ? 'Applying...' : 'Apply Adjustment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
