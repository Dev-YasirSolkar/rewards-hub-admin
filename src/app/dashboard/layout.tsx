'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.replace('/login');
        } else {
          setChecking(false);
        }
      } catch {
        router.replace('/login');
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/login');
    } catch {
      router.replace('/login');
    }
  };

  const navGroups = [
    {
      category: 'Overview',
      items: [
        { name: 'Dashboard', icon: '📊', path: '/dashboard' },
      ],
    },
    {
      category: 'User Operations',
      items: [
        { name: 'Users', icon: '👥', path: '/dashboard/users' },
        { name: 'Withdrawals', icon: '💳', path: '/dashboard/withdrawals' },
        { name: 'Transactions', icon: '💰', path: '/dashboard/transactions' },
      ],
    },
    {
      category: 'Growth & Ads',
      items: [
        { name: 'Tasks', icon: '📋', path: '/dashboard/tasks' },
        { name: 'Affiliates', icon: '🤝', path: '/dashboard/affiliates' },
        { name: 'Settings & Ads', icon: '⚙️', path: '/dashboard/settings' },
      ],
    },
    {
      category: 'Security & Ops',
      items: [
        { name: 'Fraud Monitor', icon: '🛡️', path: '/dashboard/fraud' },
        { name: 'Notifications', icon: '📢', path: '/dashboard/notifications' },
        { name: 'Audit Logs', icon: '📜', path: '/dashboard/audit' },
      ],
    },
  ];

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#090d16',
        color: '#94a3b8',
        fontSize: '0.9rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <div>Authenticating Admin Portal...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? '' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <span style={{ fontSize: '1.2rem' }}>⚡</span>
          <span style={{ color: '#f8fafc' }}>Rewards Hub</span>
          <span style={{
            fontSize: '0.65rem',
            background: 'rgba(59, 130, 246, 0.2)',
            color: '#60a5fa',
            padding: '2px 6px',
            borderRadius: '4px',
            marginLeft: 'auto',
            fontWeight: 800,
          }}>
            OPS
          </span>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
          {navGroups.map((group) => (
            <div key={group.category}>
              <div className="admin-nav-category">{group.category}</div>
              {group.items.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>Super Admin</div>
            <div style={{ fontSize: '0.68rem', color: '#10b981' }}>● Live Connected</div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: '1rem',
              padding: '4px',
            }}
          >
            🚪
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-content">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="admin-button admin-button-secondary"
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
            >
              ☰
            </button>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
              Administration Portal
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="admin-badge admin-badge-success">
              🔥 Firebase Cloud Connected
            </span>
            <button
              onClick={handleLogout}
              className="admin-button admin-button-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              Log Out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}

