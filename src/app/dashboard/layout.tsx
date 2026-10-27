'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  DashboardIcon,
  UsersIcon,
  WithdrawalsIcon,
  TransactionsIcon,
  MiningCardsIcon,
  DailyActivitiesIcon,
  TasksIcon,
  AffiliatesIcon,
  SettingsIcon,
  FraudIcon,
  NotificationsIcon,
  AuditIcon,
  CrownIcon,
  LogoutIcon,
  SpinnerIcon,
} from '@/components/AdminIcons';

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
        { name: 'Dashboard', icon: <DashboardIcon size={18} />, path: '/dashboard' },
      ],
    },
    {
      category: 'User Operations',
      items: [
        { name: 'Users', icon: <UsersIcon size={18} />, path: '/dashboard/users' },
        { name: 'Withdrawals', icon: <WithdrawalsIcon size={18} />, path: '/dashboard/withdrawals' },
        { name: 'Transactions', icon: <TransactionsIcon size={18} />, path: '/dashboard/transactions' },
      ],
    },
    {
      category: 'Growth & Ads',
      items: [
        { name: 'Mining Cards', icon: <MiningCardsIcon size={18} />, path: '/dashboard/mining-cards' },
        { name: 'Daily Activities', icon: <DailyActivitiesIcon size={18} />, path: '/dashboard/daily-activities' },
        { name: 'Tasks', icon: <TasksIcon size={18} />, path: '/dashboard/tasks' },
        { name: 'Affiliates', icon: <AffiliatesIcon size={18} />, path: '/dashboard/affiliates' },
        { name: 'Settings & Ads', icon: <SettingsIcon size={18} />, path: '/dashboard/settings' },
      ],
    },
    {
      category: 'Security & Ops',
      items: [
        { name: 'Fraud Monitor', icon: <FraudIcon size={18} />, path: '/dashboard/fraud' },
        { name: 'Notifications', icon: <NotificationsIcon size={18} />, path: '/dashboard/notifications' },
        { name: 'Audit Logs', icon: <AuditIcon size={18} />, path: '/dashboard/audit' },
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <SpinnerIcon size={32} color="#facc15" />
          </div>
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
          <CrownIcon size={22} color="#facc15" />
          <span style={{ color: '#FDE047', fontWeight: 900 }}>Yasir Fest</span>
          <span style={{
            fontSize: '0.65rem',
            background: 'rgba(245, 158, 11, 0.2)',
            color: '#FDE047',
            padding: '2px 6px',
            borderRadius: '4px',
            marginLeft: 'auto',
            fontWeight: 800,
          }}>
            ADMIN
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
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
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
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#f87171',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogoutIcon size={16} color="#f87171" />
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
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CrownIcon size={18} color="#facc15" /> Administration Portal
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="admin-badge admin-badge-success" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Firebase Cloud Connected
            </span>
            <button
              onClick={handleLogout}
              className="admin-button admin-button-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <LogoutIcon size={13} color="#94a3b8" /> Log Out
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

