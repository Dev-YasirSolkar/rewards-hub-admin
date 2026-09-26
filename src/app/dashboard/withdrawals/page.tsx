'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';

interface Withdrawal {
  id: string;
  userId: string;
  userName?: string;
  userUsername?: string;
  userTelegramId?: number;
  amount: number;
  method: string;
  status: string;
  paymentDetails?: {
    upiId?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountName?: string;
    notes?: string;
  };
  rejectionReason?: string;
  createdAt: string;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const url = status === 'all'
        ? '/api/admin/withdrawals'
        : `/api/admin/withdrawals?status=${status}`;

      const res = await adminFetch(url);
      if (res.success && res.data) {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data as any).withdrawals || (res as any).withdrawals || [];
        setWithdrawals(list);
      }
    } catch (e) {
      console.error('Failed to load withdrawals', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleMarkSuccess = async (id: string) => {
    if (!confirm('Mark this withdrawal as SUCCESS / PAID? Confirm that you have transferred the funds to user.')) return;
    try {
      const res = await adminFetch(`/api/admin/withdrawals/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ status: 'success' }),
      });
      if (res.success) {
        alert('✓ Withdrawal marked as SUCCESS / PAID!');
        fetchWithdrawals();
      } else {
        alert(res.error || 'Failed to update withdrawal');
      }
    } catch {
      alert('Network error while updating withdrawal');
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Mark this withdrawal request as APPROVED (Processing)?')) return;
    try {
      const res = await adminFetch(`/api/admin/withdrawals/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ status: 'approved' }),
      });
      if (res.success) {
        alert('✓ Withdrawal marked as APPROVED!');
        fetchWithdrawals();
      } else {
        alert(res.error || 'Failed to approve withdrawal');
      }
    } catch {
      alert('Network error while approving');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason (will be visible to user and points refunded):');
    if (!reason || !reason.trim()) return;
    try {
      const res = await adminFetch(`/api/admin/withdrawals/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectionReason: reason.trim() }),
      });
      if (res.success) {
        alert('✓ Withdrawal rejected and points refunded to user wallet!');
        fetchWithdrawals();
      } else {
        alert(res.error || 'Failed to reject withdrawal');
      }
    } catch {
      alert('Network error while rejecting');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
            Withdrawal Management
          </h2>
          <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
            Review, verify payment details, and approve user payouts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            className="admin-input"
            style={{ width: 'auto', minWidth: '130px', margin: 0, padding: '5px 10px', fontSize: '12px' }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved (Processing)</option>
            <option value="success">Success / Paid</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            className="admin-button"
            style={{ padding: '5px 12px', fontSize: '12px' }}
            onClick={fetchWithdrawals}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="admin-card admin-table-container" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            Loading withdrawals...
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>User</th>
                <th style={{ width: '100px' }}>Amount</th>
                <th style={{ width: '80px' }}>Method</th>
                <th>Payment Details</th>
                <th style={{ width: '90px' }}>Status</th>
                <th style={{ width: '120px' }}>Date</th>
                <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '28px', color: '#94a3b8', fontSize: '13px' }}>
                    No withdrawal requests found for &quot;{status}&quot;.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => {
                  const isPending = w.status === 'pending';
                  const details = w.paymentDetails || {};

                  return (
                    <tr key={w.id}>
                      {/* User Column */}
                      <td>
                        <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '13px' }}>
                          {w.userName || 'User'}
                        </div>
                        {w.userUsername && (
                          <div style={{ fontSize: '11px', color: '#60a5fa' }}>
                            @{w.userUsername}
                          </div>
                        )}
                        <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                          ID: {w.userTelegramId || w.userId}
                        </div>
                      </td>

                      {/* Amount Column */}
                      <td>
                        <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '13px' }}>
                          {w.amount.toLocaleString()} pts
                        </span>
                      </td>

                      {/* Method Column */}
                      <td>
                        <span style={{
                          textTransform: 'uppercase',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#192231',
                          color: '#94a3b8',
                        }}>
                          {w.method}
                        </span>
                      </td>

                      {/* Payment Details Column */}
                      <td>
                        {w.method === 'upi' && details.upiId && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', color: '#f8fafc', fontFamily: 'monospace', fontWeight: 600 }}>
                              {details.upiId}
                            </span>
                            <button
                              onClick={() => handleCopy(details.upiId!, w.id)}
                              style={{
                                background: '#192231',
                                border: '1px solid #1e293b',
                                color: copiedId === w.id ? '#10b981' : '#60a5fa',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: 'pointer',
                              }}
                            >
                              {copiedId === w.id ? '✓ Copied' : 'Copy'}
                            </button>
                          </div>
                        )}

                        {w.method === 'bank_transfer' && (
                          <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>
                            {details.accountName && <div><b>Name:</b> {details.accountName}</div>}
                            {details.accountNumber && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span><b>A/C:</b> {details.accountNumber}</span>
                                <button
                                  onClick={() => handleCopy(details.accountNumber!, `acc-${w.id}`)}
                                  style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '10px', cursor: 'pointer' }}
                                >
                                  {copiedId === `acc-${w.id}` ? '✓' : 'Copy'}
                                </button>
                              </div>
                            )}
                            {details.ifscCode && <div><b>IFSC:</b> {details.ifscCode}</div>}
                          </div>
                        )}

                        {w.method === 'other' && (
                          <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                            {details.notes || 'No extra details'}
                          </div>
                        )}

                        {w.rejectionReason && (
                          <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>
                            Reason: {w.rejectionReason}
                          </div>
                        )}
                      </td>

                      {/* Status Column */}
                      <td>
                        <span
                          className={`admin-badge ${
                            w.status === 'success' || w.status === 'paid'
                              ? 'admin-badge-success'
                              : w.status === 'approved'
                              ? 'admin-badge-info'
                              : w.status === 'rejected'
                              ? 'admin-badge-danger'
                              : 'admin-badge-warning'
                          }`}
                        >
                          {w.status === 'success' || w.status === 'paid'
                            ? '✓ Success'
                            : w.status === 'approved'
                            ? 'Approved'
                            : w.status === 'rejected'
                            ? '✕ Rejected'
                            : 'Pending'}
                        </span>
                      </td>

                      {/* Date Column */}
                      <td style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Actions Column */}
                      <td style={{ textAlign: 'right' }}>
                        {isPending ? (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleMarkSuccess(w.id)}
                              className="admin-button"
                              title="Confirm payment & mark as Success"
                              style={{
                                background: '#10b981',
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              ✓ Pay (Success)
                            </button>
                            <button
                              onClick={() => handleApprove(w.id)}
                              className="admin-button"
                              title="Mark as Approved / Processing"
                              style={{
                                background: '#3b82f6',
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(w.id)}
                              className="admin-button admin-button-danger"
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : w.status === 'approved' ? (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleMarkSuccess(w.id)}
                              className="admin-button"
                              title="Complete payment and mark as Success"
                              style={{
                                background: '#10b981',
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              ✓ Mark Success
                            </button>
                            <button
                              onClick={() => handleReject(w.id)}
                              className="admin-button admin-button-danger"
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>—</span>
                        )}
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

