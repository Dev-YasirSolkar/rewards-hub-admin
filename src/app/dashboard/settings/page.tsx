'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';

interface AdminSettings {
  dailyCheckinRewards: number[];
  referralEnabled: boolean;
  referralReward: number;
  maxReferralReward?: number;
  withdrawalEnabled: boolean;
  withdrawalMinimum: number;
  withdrawalMaximum?: number;
  withdrawalCooldownHours?: number;
  adEnabled?: boolean;
  adProvider?: string;
  adReward?: number;
  adDailyLimit?: number;
  adCooldownSeconds?: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({
    dailyCheckinRewards: [10, 20, 30, 40, 50, 75, 100],
    referralEnabled: true,
    referralReward: 100,
    withdrawalEnabled: true,
    withdrawalMinimum: 500,
    withdrawalMaximum: 50000,
    withdrawalCooldownHours: 24,
    adEnabled: true,
    adProvider: 'monetag',
    adReward: 15,
    adDailyLimit: 15,
    adCooldownSeconds: 30,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/settings');
      if (res.success && res.data) {
        const d = res.data;
        setSettings({
          dailyCheckinRewards: Array.isArray(d.dailyCheckinRewards) && d.dailyCheckinRewards.length === 7
            ? d.dailyCheckinRewards
            : [10, 20, 30, 40, 50, 75, 100],
          referralEnabled: d.referralEnabled !== false,
          referralReward: Number(d.referralReward ?? 100),
          maxReferralReward: d.maxReferralReward ? Number(d.maxReferralReward) : undefined,
          withdrawalEnabled: d.withdrawalEnabled !== false,
          withdrawalMinimum: Number(d.withdrawalMinimum ?? d.minWithdrawal ?? 500),
          withdrawalMaximum: d.withdrawalMaximum ? Number(d.withdrawalMaximum) : 50000,
          withdrawalCooldownHours: d.withdrawalCooldownHours ? Number(d.withdrawalCooldownHours) : 24,
          adEnabled: d.adEnabled !== false,
          adProvider: d.adProvider || 'monetag',
          adReward: Number(d.adReward ?? 15),
          adDailyLimit: Number(d.adDailyLimit ?? 15),
          adCooldownSeconds: Number(d.adCooldownSeconds ?? 30),
        });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleRewardChange = (index: number, val: number) => {
    const updated = [...settings.dailyCheckinRewards];
    updated[index] = Math.max(0, val);
    setSettings({ ...settings, dailyCheckinRewards: updated });
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const payload = {
        dailyCheckinRewards: settings.dailyCheckinRewards.map(Number),
        referralEnabled: Boolean(settings.referralEnabled),
        referralReward: Number(settings.referralReward),
        withdrawalEnabled: Boolean(settings.withdrawalEnabled),
        withdrawalMinimum: Number(settings.withdrawalMinimum),
        withdrawalMaximum: Number(settings.withdrawalMaximum || 50000),
        withdrawalCooldownHours: Number(settings.withdrawalCooldownHours || 24),
        adEnabled: Boolean(settings.adEnabled),
        adProvider: String(settings.adProvider || 'monetag'),
        adReward: Number(settings.adReward || 15),
        adDailyLimit: Number(settings.adDailyLimit || 15),
        adCooldownSeconds: Number(settings.adCooldownSeconds || 30),
      };

      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSaveMessage('✓ All settings saved successfully! Ad settings and User App updated in real-time.');
        fetchSettings();
      } else {
        alert(res.error || 'Failed to save settings');
      }
    } catch {
      alert('Network error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px 0' }}>
        <div className="skeleton-box" style={{ height: '70px', marginBottom: '16px' }} />
        <div className="skeleton-box" style={{ height: '180px', marginBottom: '16px' }} />
        <div className="skeleton-box" style={{ height: '220px', marginBottom: '16px' }} />
        <div className="skeleton-box" style={{ height: '240px' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 4px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚙️</span> Platform Economy & System Configuration
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
            Modify reward amounts, ads configuration, referral incentives, and withdrawal rules. Changes propagate in real-time.
          </p>
        </div>
        <button
          className="btn-3d-gold"
          onClick={saveSettings}
          disabled={saving}
          style={{ padding: '10px 22px', fontSize: '13px' }}
        >
          {saving ? 'Saving...' : '💾 Commit Changes'}
        </button>
      </div>

      {saveMessage && (
        <div style={{
          background: 'rgba(35, 134, 54, 0.2)',
          border: '1px solid #3fb950',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#3fb950',
          fontWeight: 600,
          marginBottom: '20px',
        }}>
          {saveMessage}
        </div>
      )}

      {/* 1. Daily Check-in Streak Rewards */}
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <h3 className="text-xl mb-2 font-semibold">📅 7-Day Daily Check-in Rewards</h3>
        <p style={{ color: '#8b949e', fontSize: '13px', margin: '0 0 16px' }}>
          Configure point values granted to users for each consecutive day of check-in:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
          {settings.dailyCheckinRewards.map((reward, i) => (
            <div key={i} style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#58a6ff', display: 'block', marginBottom: '6px' }}>
                Day {i + 1}
              </label>
              <input
                type="number"
                className="admin-input"
                value={reward}
                onChange={(e) => handleRewardChange(i, Number(e.target.value))}
                style={{ textAlign: 'center', fontWeight: 700, margin: 0 }}
                min="0"
              />
              <span style={{ fontSize: '10px', color: '#8b949e', marginTop: '4px', display: 'block' }}>pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. In-App Ads Configuration */}
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 className="text-xl font-semibold" style={{ margin: 0 }}>📺 In-App Ads Configuration</h3>
            <p style={{ color: '#8b949e', fontSize: '13px', margin: '2px 0 0' }}>
              Control rewarded video ads, rewards per ad, daily caps, and cooldown delays.
            </p>
          </div>
          <span style={{ background: settings.adEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: settings.adEnabled ? '#10b981' : '#ef4444', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
            {settings.adEnabled ? '● Ads Active' : '○ Ads Paused'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div>
            <label className="flex items-center gap-2 mb-2" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.adEnabled}
                onChange={(e) => setSettings({ ...settings, adEnabled: e.target.checked })}
              />
              <span style={{ fontWeight: 600 }}>Enable Video & Popup Ads in User App</span>
            </label>
            <p style={{ color: '#8b949e', fontSize: '11px', margin: 0 }}>
              When enabled, users can watch Rewarded Interstitial and Popup ads to earn points.
            </p>
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-400">Reward Per Ad (PTS)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.adReward ?? 15}
              onChange={(e) => setSettings({ ...settings, adReward: Number(e.target.value) })}
              min="1"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-400">Daily Ad Limit (Per User)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.adDailyLimit ?? 15}
              onChange={(e) => setSettings({ ...settings, adDailyLimit: Number(e.target.value) })}
              min="1"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-400">Cooldown Between Ads (Seconds)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.adCooldownSeconds ?? 30}
              onChange={(e) => setSettings({ ...settings, adCooldownSeconds: Number(e.target.value) })}
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="admin-grid">
        {/* 3. Referral Settings */}
        <div className="admin-card">
          <h3 className="text-xl mb-4 font-semibold">👥 Referral Program</h3>
          
          <div className="mb-4">
            <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.referralEnabled}
                onChange={(e) => setSettings({ ...settings, referralEnabled: e.target.checked })}
              />
              <span style={{ fontWeight: 600 }}>Enable Referral Program</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm text-gray-400">Reward Per Referral (Points)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.referralReward}
              onChange={(e) => setSettings({ ...settings, referralReward: Number(e.target.value) })}
              min="0"
            />
            <p style={{ color: '#8b949e', fontSize: '11px', marginTop: '4px' }}>
              Points awarded to the inviter when a new friend joins using their link.
            </p>
          </div>
        </div>

        {/* 4. Withdrawal Settings */}
        <div className="admin-card">
          <h3 className="text-xl mb-4 font-semibold">💸 Withdrawal Rules</h3>
          
          <div className="mb-4">
            <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.withdrawalEnabled}
                onChange={(e) => setSettings({ ...settings, withdrawalEnabled: e.target.checked })}
              />
              <span style={{ fontWeight: 600 }}>Allow User Withdrawals</span>
            </label>
            <p style={{ color: '#8b949e', fontSize: '11px', margin: '4px 0 0 20px' }}>
              Uncheck to pause all withdrawal requests in the app.
            </p>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm text-gray-400">Minimum Withdrawal (Points)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.withdrawalMinimum}
              onChange={(e) => setSettings({ ...settings, withdrawalMinimum: Number(e.target.value) })}
              min="1"
            />
            <p style={{ color: '#8b949e', fontSize: '11px', marginTop: '4px' }}>
              Users cannot request less than this amount.
            </p>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm text-gray-400">Maximum Withdrawal (Points)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.withdrawalMaximum || 50000}
              onChange={(e) => setSettings({ ...settings, withdrawalMaximum: Number(e.target.value) })}
              min="100"
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <button
          className="admin-button"
          onClick={saveSettings}
          disabled={saving}
          style={{ padding: '12px 24px', fontSize: '15px' }}
        >
          {saving ? 'Saving Changes...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}

