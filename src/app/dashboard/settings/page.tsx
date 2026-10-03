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
  spinDailyLimit?: number;
  maintenanceMode?: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({
    dailyCheckinRewards: [500, 1000, 2500, 5000, 15000, 25000, 100000],
    referralEnabled: true,
    referralReward: 5000,
    withdrawalEnabled: true,
    withdrawalMinimum: 100000,
    withdrawalMaximum: 50000000,
    withdrawalCooldownHours: 24,
    adEnabled: true,
    adProvider: 'monetag',
    adReward: 1000,
    adDailyLimit: 15,
    adCooldownSeconds: 30,
    spinDailyLimit: 5,
    maintenanceMode: false,
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
      const res = await adminFetch('/api/admin/settings?refresh=true');
      if (res.success && res.data) {
        const d = res.data;
        setSettings({
          dailyCheckinRewards: Array.isArray(d.dailyCheckinRewards) && d.dailyCheckinRewards.length === 7
            ? d.dailyCheckinRewards
            : [500, 1000, 2500, 5000, 15000, 25000, 100000],
          referralEnabled: d.referralEnabled !== false,
          referralReward: Number(d.referralReward ?? 5000),
          maxReferralReward: d.maxReferralReward ? Number(d.maxReferralReward) : undefined,
          withdrawalEnabled: d.withdrawalEnabled !== false,
          withdrawalMinimum: Number(d.withdrawalMinimum ?? d.minWithdrawal ?? 100000),
          withdrawalMaximum: d.withdrawalMaximum ? Number(d.withdrawalMaximum) : 50000000,
          withdrawalCooldownHours: d.withdrawalCooldownHours ? Number(d.withdrawalCooldownHours) : 24,
          adEnabled: d.adEnabled !== false,
          adProvider: d.adProvider || 'monetag',
          adReward: Number(d.adReward ?? 1000),
          adDailyLimit: Number(d.adDailyLimit ?? 15),
          adCooldownSeconds: Number(d.adCooldownSeconds ?? 30),
          spinDailyLimit: Number(d.spinDailyLimit ?? 5),
          maintenanceMode: Boolean(d.maintenanceMode),
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
        withdrawalMaximum: Number(settings.withdrawalMaximum || 50000000),
        withdrawalCooldownHours: Number(settings.withdrawalCooldownHours || 24),
        adEnabled: Boolean(settings.adEnabled),
        adProvider: String(settings.adProvider || 'monetag'),
        adReward: Number(settings.adReward || 1000),
        adDailyLimit: Number(settings.adDailyLimit || 15),
        adCooldownSeconds: Number(settings.adCooldownSeconds || 30),
        spinDailyLimit: Number(settings.spinDailyLimit || 5),
        maintenanceMode: Boolean(settings.maintenanceMode),
      };

      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSaveMessage('✓ All settings saved successfully! Propagated to User App in real-time.');
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
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 4px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚙️</span> Platform Economy &amp; Game Configuration
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
            Control Doracakes daily check-in rewards, Monetag ads, lucky spin caps, referral rewards, and withdrawal thresholds.
          </p>
        </div>
        <button
          className="admin-button admin-button-primary"
          onClick={saveSettings}
          disabled={saving}
          style={{ padding: '10px 22px', fontSize: '13px', fontWeight: 800 }}
        >
          {saving ? 'Saving...' : '💾 Save All Changes'}
        </button>
      </div>

      {saveMessage && (
        <div style={{
          background: 'rgba(35, 134, 54, 0.2)',
          border: '1px solid #3fb950',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#3fb950',
          fontWeight: 700,
          marginBottom: '20px',
        }}>
          {saveMessage}
        </div>
      )}

      {/* 1. Daily Check-in Streak Rewards */}
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px', color: '#f8fafc' }}>
          📅 7-Day Streak Check-in Rewards (Doracakes 🥞)
        </h3>
        <p style={{ color: '#8b949e', fontSize: '13px', margin: '0 0 16px' }}>
          Configure Doracakes granted to players for each consecutive day of check-in:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px' }}>
          {settings.dailyCheckinRewards.map((reward, i) => (
            <div key={i} style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b', display: 'block', marginBottom: '6px' }}>
                Day {i + 1}
              </label>
              <input
                type="number"
                className="admin-input"
                value={reward}
                onChange={(e) => handleRewardChange(i, Number(e.target.value))}
                style={{ textAlign: 'center', fontWeight: 800, margin: 0 }}
                min="0"
                step="500"
              />
              <span style={{ fontSize: '10px', color: '#8b949e', marginTop: '4px', display: 'block' }}>🥞 Doracakes</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. In-App Monetag Ads Configuration */}
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px', color: '#f8fafc' }}>
              📺 Monetag Ads &amp; Rewarded Video
            </h3>
            <p style={{ color: '#8b949e', fontSize: '13px', margin: 0 }}>
              Configure video ad rewards, daily ad limits, and cooldown delays.
            </p>
          </div>
          <span style={{ background: settings.adEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: settings.adEnabled ? '#10b981' : '#ef4444', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
            {settings.adEnabled ? '● Ads Active' : '○ Ads Paused'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div>
            <label className="admin-label" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.adEnabled}
                onChange={(e) => setSettings({ ...settings, adEnabled: e.target.checked })}
              />
              <span>Enable Monetag Ads in User App</span>
            </label>
            <p style={{ color: '#8b949e', fontSize: '11px', margin: '4px 0 0 20px' }}>
              Users can watch Rewarded Interstitials to earn bonus Doracakes and lucky spins.
            </p>
          </div>

          <div>
            <label className="admin-label">Reward Per Video Ad (Doracakes)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.adReward ?? 1000}
              onChange={(e) => setSettings({ ...settings, adReward: Number(e.target.value) })}
              min="100"
              step="500"
            />
          </div>

          <div>
            <label className="admin-label">Daily Video Ad Limit (Per Miner)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.adDailyLimit ?? 15}
              onChange={(e) => setSettings({ ...settings, adDailyLimit: Number(e.target.value) })}
              min="1"
            />
          </div>

          <div>
            <label className="admin-label">Cooldown Between Ads (Seconds)</label>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* 3. Referral Program & Spin Wheel */}
        <div className="admin-card" style={{ margin: 0 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 12px', color: '#f8fafc' }}>
            👥 Referrals &amp; Lucky Spin
          </h3>
          
          <div style={{ marginBottom: '14px' }}>
            <label className="admin-label" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.referralEnabled}
                onChange={(e) => setSettings({ ...settings, referralEnabled: e.target.checked })}
              />
              <span>Enable Referral Invites</span>
            </label>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Reward Per Direct Referral (Doracakes 🥞)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.referralReward}
              onChange={(e) => setSettings({ ...settings, referralReward: Number(e.target.value) })}
              min="0"
              step="500"
            />
            <p style={{ color: '#8b949e', fontSize: '11px', marginTop: '4px' }}>
              Awarded to the inviter when a new friend joins via their referral link.
            </p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Lucky Spin Daily Ad Spins Limit</label>
            <input
              type="number"
              className="admin-input"
              value={settings.spinDailyLimit ?? 5}
              onChange={(e) => setSettings({ ...settings, spinDailyLimit: Number(e.target.value) })}
              min="1"
              max="50"
            />
            <p style={{ color: '#8b949e', fontSize: '11px', marginTop: '4px' }}>
              Max extra spins a player can unlock each day by watching ads (default: 5).
            </p>
          </div>
        </div>

        {/* 4. Withdrawal Rules */}
        <div className="admin-card" style={{ margin: 0 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 12px', color: '#f8fafc' }}>
            💸 Withdrawal &amp; Payout Rules
          </h3>
          
          <div style={{ marginBottom: '14px' }}>
            <label className="admin-label" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.withdrawalEnabled}
                onChange={(e) => setSettings({ ...settings, withdrawalEnabled: e.target.checked })}
              />
              <span>Allow Miner Withdrawals</span>
            </label>
            <p style={{ color: '#8b949e', fontSize: '11px', margin: '4px 0 0 20px' }}>
              Uncheck to pause all withdrawal requests in the user app.
            </p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Minimum Withdrawal Threshold (Doracakes)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.withdrawalMinimum}
              onChange={(e) => setSettings({ ...settings, withdrawalMinimum: Number(e.target.value) })}
              min="1000"
              step="10000"
            />
            <p style={{ color: '#8b949e', fontSize: '11px', marginTop: '4px' }}>
              Users cannot request less than this balance.
            </p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Maximum Single Withdrawal (Doracakes)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.withdrawalMaximum || 50000000}
              onChange={(e) => setSettings({ ...settings, withdrawalMaximum: Number(e.target.value) })}
              min="10000"
              step="1000000"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
