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
      const url = typeFilter === 'all' ? '/api/admin/transactions' : `/api/admin/transactions?type=${typeFilter}`;
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#f0f6fc' }}>Global Transactions</h2>
          <p style={{ margin: '4px 0 0', color: '#8b949e', fontSize: '0.875rem' }}>
            Live ledger of all points earned, bonuses credited, and withdrawals requested.
          </p>
        </div>
        <button onClick={fetchTransactions} className="admin-button" style={{ padding: '6px 14px', fontSize: '13px' }}>
          ↻ Refresh
        </button>
      </div>

      <div className="admin-card" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ color: '#8b949e', fontSize: '0.875rem' }}>Filter by Type:</label>
        <select 
          className="admin-input"
          style={{ width: 'auto', minWidth: '180px', margin: 0 }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="task_reward">Task Reward</option>
          <option value="daily_bonus">Daily Check-In</option>
          <option value="referral_bonus">Referral Bonus</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="withdrawal_reversal">Withdrawal Reversal (Refund)</option>
          <option value="admin_adjustment">Admin Adjustment</option>
        </select>
      </div>

      <div className="admin-card admin-table-container">
        {loading ? (
          <p style={{ color: '#8b949e', textAlign: 'center', padding: '20px' }}>Loading transactions...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>User ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#8b949e' }}>
                    No transactions found for this filter.
                  </td>
                </tr>
              ) : (
                transactions.map(t => {
                  const isPositive = t.amount > 0;
                  return (
                    <tr key={t.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#8b949e' }}>
                        {t.id?.substring(0, 8)}...
                      </td>
                      <td>
                        <Link href={`/dashboard/users/${t.userId}`} style={{ color: '#58a6ff', textDecoration: 'none', fontFamily: 'monospace' }}>
                          {t.userId}
                        </Link>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          background: '#21262d',
                          color: '#c9d1d9',
                          border: '1px solid #30363d',
                          textTransform: 'capitalize',
                        }}>
                          {t.type?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: isPositive ? '#3fb950' : '#f85149',
                        }}>
                          {isPositive ? '+' : ''}{t.amount} pts
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#c9d1d9', maxWidth: '300px' }}>
                        {t.description || '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#8b949e', whiteSpace: 'nowrap' }}>
                        {formatDate(t.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

