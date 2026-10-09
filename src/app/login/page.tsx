'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) {
      setError('Please enter the admin secret key');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secret.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Authentication failed. Check your secret key.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #111827 0%, #090d16 100%)',
      padding: '1.5rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#0d121f',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.15))',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 1rem',
          }}>
            👑
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FDE047', marginBottom: '0.4rem' }}>
            Yasir Fest Admin
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Enter your secure Master Secret Key to access the culinary command center.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.82rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#94a3b8',
              marginBottom: '0.5rem',
            }}>
              Master Secret Key
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="••••••••••••••••"
              autoFocus
              className="admin-input"
              style={{
                fontSize: '0.95rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-button"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.9rem',
              borderRadius: '8px',
            }}
          >
            {loading ? 'Verifying...' : 'Unlock Admin Portal →'}
          </button>
        </form>

        {/* Footer info */}
        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #1e293b', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Isolated Private Operations Portal • 256-bit Encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
