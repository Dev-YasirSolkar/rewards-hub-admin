'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-client';

const CHARACTER_TIERS: Record<number, { name: string; avatar: string; color: string; tagline: string }> = {
  1: { name: 'Food Noob', avatar: '🍳', color: '#f59e0b', tagline: 'Beginner Kitchen Worker' },
  2: { name: 'Delivery Rider', avatar: '🛵', color: '#eab308', tagline: 'Food Delivery Worker' },
  3: { name: 'Senior Rider', avatar: '⚡', color: '#ec4899', tagline: 'Experienced Delivery Professional' },
  4: { name: 'Street Food Vendor', avatar: '🌮', color: '#38bdf8', tagline: 'Small Food Business' },
  5: { name: 'Cafe Owner', avatar: '☕', color: '#f97316', tagline: 'Independent Business Owner' },
  6: { name: 'Restaurant Manager', avatar: '👨‍🍳', color: '#facc15', tagline: 'Restaurant Operations' },
  7: { name: 'Restaurant Director', avatar: '🎩', color: '#3b82f6', tagline: 'Business Leadership' },
  8: { name: 'Food Tycoon', avatar: '🏢', color: '#a855f7', tagline: 'Restaurant Chain Owner' },
  9: { name: 'Food Mogul', avatar: '💎', color: '#ec4899', tagline: 'Billionaire Entrepreneur' },
  10: { name: 'Global Food CEO', avatar: '👑', color: '#fbbf24', tagline: 'Ultimate Business Leader' },
};

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
      const res = await adminFetch(`/api/admin/users/${encodeURIComponent(id)}?refresh=true`);
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
    if (!confirm('Reactivate this miner account now?')) return;
    try {
      const res = await adminFetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active' }),
      });
      if (res.success) {
        alert('Miner account reactivated successfully!');
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
    } catch (e) {
      console.error(e);
      alert('Error suspending user');
    } finally {
      setSubmittingSuspend(false);
    }
  };

  const handleAdjustBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(adjustAmount, 10);
    if (isNaN(amt) || amt === 0) {
      alert('Enter a valid non-zero amount of $SOLK');
      return;
    }

    setSubmittingAdjust(true);
    try {
      const res = await adminFetch(`/api/admin/users/${encodeURIComponent(id)}/adjust-balance`, {
        method: 'POST',
        body: JSON.stringify({
          amount: amt,
          reason: adjustReason.trim() || 'Manual adjustment by admin',
        }),
      });

      if (res.success) {
        alert(`$SOLK balance adjusted by ${amt > 0 ? '+' : ''}${amt.toLocaleString()} $SOLK!`);
        setShowAdjustModal(false);
        setAdjustAmount('');
        setAdjustReason('');
        fetchUser();
      } else {
        alert(res.error || 'Failed to adjust balance');
      }
    } catch (e) {
      console.error(e);
      alert('Error adjusting balance');
    } finally {
      setSubmittingAdjust(false);
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

  if (loading) {
    return (
      <div style={{ padding: '20px 0' }}>
        <div className="skeleton-box" style={{ height: '40px', width: '200px', marginBottom: '16px' }} />
        <div className="skeleton-box" style={{ height: '140px', marginBottom: '20px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="skeleton-box" style={{ height: '260px' }} />
          <div className="skeleton-box" style={{ height: '260px' }} />
        </div>
      </div>
    );
  }

  if (errorMsg || !user) {
    return (
      <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ color: '#f85149', margin: '0 0 0.5rem' }}>Error Loading Miner Profile</h2>
        <p style={{ color: '#8b949e', marginBottom: '1.5rem' }}>{errorMsg || 'User document not found'}</p>
        <Link href="/dashboard/users" className="admin-button">
          ← Back to User List
        </Link>
      </div>
    );
  }

  const isSuspended = user.status === 'suspended' || user.isBanned;
  const hasExpiry = isSuspended && user.suspendedUntil;
  const isExpired = hasExpiry && new Date(user.suspendedUntil).getTime() <= Date.now();
  const tier = CHARACTER_TIERS[user.level || 1] || CHARACTER_TIERS[1];
  const miningCardsObj = (typeof user.miningCards === 'object' && user.miningCards) ? user.miningCards : {};
  const unlockedCards = Object.entries(miningCardsObj).filter(([, lvl]) => Number(lvl) > 0);

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/dashboard/users" className="admin-button" style={{ padding: '6px 12px' }}>
            ← Back
          </Link>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{tier.avatar}</span>
              <span>{user.firstName} {user.lastName || ''}</span>
              {user.username && <span style={{ color: '#58a6ff', fontSize: '0.9rem' }}>@{user.username}</span>}
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '2px' }}>
              UID: <span style={{ fontFamily: 'monospace' }}>{user.id}</span> • Telegram ID: <span style={{ fontFamily: 'monospace' }}>{user.telegramId}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowAdjustModal(true)} className="admin-button admin-button-primary">
            💰 Adjust $SOLK
          </button>
          {isSuspended && !isExpired ? (
            <button onClick={handleUnsuspend} className="admin-button" style={{ borderColor: '#238636', color: '#3fb950' }}>
              ✓ Reactivate Chef
            </button>
          ) : (
            <button onClick={() => setShowSuspendModal(true)} className="admin-button" style={{ borderColor: '#da3633', color: '#f85149' }}>
              🛑 Suspend / Ban
            </button>
          )}
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Tier Card */}
        <div
          className="admin-card"
          style={{
            margin: 0,
            background: `linear-gradient(135deg, ${tier.color}15, #0f172a)`,
            border: `1px solid ${tier.color}40`,
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>CAREER POSITION</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.8rem' }}>{tier.avatar}</span>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: tier.color }}>
                Level {user.level || 1}: {tier.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{tier.tagline}</div>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="admin-card" style={{ margin: 0 }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>CURRENT $SOLK BALANCE</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b', marginTop: '4px' }}>
            {(user.coins ?? user.pointsBalance ?? 0).toLocaleString()} $SOLK
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
            Lifetime Earned: {(user.lifetimeEarned || 0).toLocaleString()}
          </div>
        </div>

        {/* Profit Per Hour */}
        <div className="admin-card" style={{ margin: 0 }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>PASSIVE MINING YIELD</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399', marginTop: '4px' }}>
            +{(user.profitPerHour || 0).toLocaleString()} <span style={{ fontSize: '0.85rem' }}>/ hr</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
            From {unlockedCards.length} unlocked gadget cards
          </div>
        </div>

        {/* Energy & Streak */}
        <div className="admin-card" style={{ margin: 0 }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>ENERGY &amp; STREAK</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            ⚡ {user.energy || 0} / {user.maxEnergy || 1000}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#facc15', marginTop: '2px' }}>
            🔥 {user.checkinStreak || 0}-Day Check-in Streak
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Unlocked Mining Cards Portfolio */}
        <div className="admin-card" style={{ margin: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f0f6fc', margin: '0 0 0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⛏️</span> Mining Cards Portfolio ({unlockedCards.length} Cards)
          </h3>
          {unlockedCards.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1rem 0' }}>
              No mining cards unlocked yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {unlockedCards.map(([cardId, lvl]) => (
                <div
                  key={cardId}
                  style={{
                    background: '#090d16',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    padding: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cardId.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#f59e0b', marginTop: '2px' }}>
                    Lvl {String(lvl)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payout Details & Anti-Fraud */}
        <div className="admin-card" style={{ margin: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f0f6fc', margin: '0 0 0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💳</span> Payout &amp; Security Profile
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
              <span style={{ color: '#8b949e' }}>Payout Method:</span>
              <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                {user.payoutMethod?.type || user.defaultPayoutMethod || 'Not Configured'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
              <span style={{ color: '#8b949e' }}>Account / Wallet:</span>
              <span style={{ fontWeight: 600, color: '#f0f6fc', fontFamily: 'monospace' }}>
                {user.payoutMethod?.account || user.walletAddress || user.savedUpiId || '—'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
              <span style={{ color: '#8b949e' }}>Account Status:</span>
              <span style={{ fontWeight: 700, color: isSuspended && !isExpired ? '#f85149' : '#3fb950' }}>
                {isSuspended && !isExpired ? (user.suspendedUntil ? 'Temp Suspended' : 'Banned') : 'Active / Good Standing'}
              </span>
            </div>

            {user.fraudReason && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f85149' }}>
                <span>Flag Reason:</span>
                <span style={{ fontWeight: 600 }}>{user.fraudReason}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="admin-card" style={{ margin: '0 0 1.5rem 0' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f0f6fc', margin: '0 0 0.8rem' }}>
          Recent Transactions
        </h3>
        <div className="admin-table-container">
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
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#8b949e', padding: '1.5rem' }}>
                    No transactions recorded.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 700, color: '#60a5fa' }}>{tx.type}</td>
                    <td style={{ fontWeight: 800, color: tx.amount > 0 ? '#3fb950' : '#f85149' }}>
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} 🥞
                    </td>
                    <td style={{ color: '#8b949e', fontSize: '0.85rem' }}>{tx.description || '—'}</td>
                    <td style={{ color: '#8b949e', fontSize: '0.8rem' }}>{formatDate(tx.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Balance Modal */}
      {showAdjustModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '420px', margin: 0 }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#f0f6fc' }}>💰 Adjust $SOLK Balance</h3>
            <p style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '1rem' }}>
              Add (positive) or deduct (negative) $SOLK for <b style={{ color: '#fff' }}>{user.firstName}</b>.
            </p>

            <form onSubmit={handleAdjustBalanceSubmit}>
              <div className="admin-form-group">
                <label className="admin-label">Amount (e.g. 50000 or -10000)</label>
                <input
                  type="number"
                  className="admin-input"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Reason / Reference</label>
                <input
                  type="text"
                  className="admin-input"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Community giveaway reward / Correction"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="admin-button"
                  disabled={submittingAdjust}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-button admin-button-primary"
                  disabled={submittingAdjust}
                >
                  {submittingAdjust ? 'Processing...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '420px', margin: 0, border: '1px solid #da3633' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#f85149' }}>🛑 Suspend / Ban Miner</h3>
            <p style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '1rem' }}>
              Set suspension restrictions for <b style={{ color: '#fff' }}>{user.firstName}</b>.
            </p>

            <form onSubmit={handleSuspendSubmit}>
              <div className="admin-form-group">
                <label className="admin-label">Duration</label>
                <select
                  className="admin-input"
                  value={suspendDuration}
                  onChange={(e) => setSuspendDuration(e.target.value)}
                >
                  <option value="24h">24 Hours (1 Day)</option>
                  <option value="48h">48 Hours (2 Days)</option>
                  <option value="7d">7 Days (1 Week)</option>
                  <option value="30d">30 Days (1 Month)</option>
                  <option value="permanent">Permanent Ban</option>
                  <option value="custom">Custom Hours</option>
                </select>
              </div>

              {suspendDuration === 'custom' && (
                <div className="admin-form-group">
                  <label className="admin-label">Custom Hours</label>
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

              <div className="admin-form-group">
                <label className="admin-label">Reason</label>
                <input
                  type="text"
                  className="admin-input"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Fraudulent activity / Bot usage"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowSuspendModal(false)}
                  className="admin-button"
                  disabled={submittingSuspend}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-button"
                  style={{ backgroundColor: '#da3633', color: '#fff', borderColor: '#da3633' }}
                  disabled={submittingSuspend}
                >
                  {submittingSuspend ? 'Suspending...' : 'Confirm Ban'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
