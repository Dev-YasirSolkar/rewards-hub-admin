'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-client';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const url = typeFilter === 'all'
        ? '/api/admin/transactions?refresh=true'
        : `/api/admin/transactions?type=${typeFilter}&refresh=true`;
      const res = await adminFetch(url);
      if (res.success && res.data) {
        setTransactions(Array.isArray(res.data) ? res.data : (res.data as any).transactions || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const formatDate = (val: any) => {
    if (!val) return '—';
    try {
      if (typeof val === 'object' && val._seconds) {
        return new Date(val._seconds * 1000).toLocaleString();
      }
      const d = new Date(val);
      return isNaN(d.getTime()) ? '—' : d.toLocaleString();
    } catch {
      return '—';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 4px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💰</span> Global Points Ledger
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
            Real-time ledger of user points earned, mining claims, referral bonuses, and payout debits.
          </p>
        </div>
        <button onClick={fetchTransactions} className="btn-3d-blue" style={{ padding: '6px 14px', fontSize: '12px' }}>
          ↻ Refresh Ledger
        </button>
      </div>

      <div className="admin-card" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', padding: '12px 18px' }}>
        <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Filter Activity:</span>
        <select 
          className="admin-select"
          style={{ width: 'auto', minWidth: '220px' }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Transactions</option>
          <option value="tap_claim">Tap Claim</option>
          <option value="mining_claim">Passive Mining Claim</option>
          <option value="cipher_reward">Daily Cipher Reward</option>
          <option value="combo_reward">Daily Combo Reward</option>
          <option value="task_reward">Task Completion Reward</option>
          <option value="daily_bonus">Daily Check-In Bonus</option>
          <option value="referral_bonus">Referral Commission</option>
          <option value="withdrawal">Withdrawal Request</option>
          <option value="withdrawal_reversal">Withdrawal Reversal (Refund)</option>
          <option value="admin_adjustment">Admin Manual Adjustment</option>
        </select>
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
                  <th>Tx ID</th>
                  <th>Member ID</th>
                  <th>Type</th>
                  <th>Points Delta</th>
                  <th>Description</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                      No transactions recorded for this filter criteria.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => {
                    const isPositive = Number(t.amount) > 0;
                    return (
                      <tr key={t.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>
                          {t.id?.substring(0, 10)}...
                        </td>
                        <td>
                          <Link href={`/dashboard/users/${t.userId}`} style={{ color: '#38bdf8', textDecoration: 'none', fontFamily: 'monospace', fontWeight: 700, fontSize: '12px' }}>
                            {t.userId?.substring(0, 12)}...
                          </Link>
                        </td>
                        <td>
                          <span className="badge-blue">
                            {t.type?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            fontWeight: 900,
                            fontSize: '13px',
                            color: isPositive ? '#34d399' : '#f87171',
                            letterSpacing: '-0.01em',
                          }}>
                            {isPositive ? '+' : ''}{Number(t.amount).toLocaleString()} PTS
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '300px' }}>
                          {t.description || '—'}
                        </td>
                        <td style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                          {formatDate(t.createdAt)}
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
