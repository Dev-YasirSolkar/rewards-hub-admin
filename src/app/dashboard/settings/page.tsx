'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';
import {
  SettingsIcon,
  SaveIcon,
  TrashIcon,
  VideoIcon,
  StarIcon,
  GiftIcon,
  ClockIcon,
  UsersIcon,
  WithdrawalsIcon,
  DailyActivitiesIcon,
} from '@/components/AdminIcons';

interface MilestoneRewardConfig {
  target: number;
  reward: number;
}

interface AdminSettings {
  dailyCheckinRewards: number[];
  referralEnabled: boolean;
  referralReward: number;
  referralRewardPremium?: number;
  maxReferralReward?: number;
  milestoneVaultRewards?: MilestoneRewardConfig[];
  withdrawalEnabled: boolean;
  withdrawalMinimum: number;
  withdrawalMaximum?: number;
  withdrawalCooldownHours?: number;
  adEnabled?: boolean;
  adProvider?: string;
  adReward?: number;
  adDailyLimit?: number;
  adBundleLimit?: number;
  adBundleReward?: number;
  adCooldownSeconds?: number;
  adZoneId?: string;
  spinDailyLimit?: number;
  maintenanceMode?: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({
    dailyCheckinRewards: [500, 1000, 2500, 5000, 15000, 25000, 100000],
    referralEnabled: true,
    referralReward: 5000,
    referralRewardPremium: 25000,
    milestoneVaultRewards: [
      { target: 3, reward: 25000 },
      { target: 10, reward: 100000 },
      { target: 25, reward: 250000 },
      { target: 50, reward: 500000 },
    ],
    withdrawalEnabled: true,
    withdrawalMinimum: 100000,
    withdrawalMaximum: 50000000,
    withdrawalCooldownHours: 24,
    adEnabled: true,
    adProvider: 'monetag',
    adReward: 1000,
    adDailyLimit: 20,
    adBundleLimit: 20,
    adBundleReward: 50000,
    adCooldownSeconds: 30,
    adZoneId: '11886923',
    spinDailyLimit: 5,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheMessage, setCacheMessage] = useState('');

  const handleClearAllUsersCache = async () => {
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to delete and wipe caches for ALL users across the entire system?\n\nThis will force all user devices across Telegram to wipe their cached balances, local taps, and configurations, and reload fresh state from the database.'
    );
    if (!confirmed) return;

    setClearingCache(true);
    setCacheMessage('');
    try {
      const res = await adminFetch('/api/admin/cache-invalidate', {
        method: 'POST',
        body: JSON.stringify({ target: 'all' }),
      });
      if (res.success) {
        setCacheMessage('All users cache successfully invalidated and wiped!');
      } else {
        setCacheMessage(`Error: ${res.error || 'Failed to invalidate cache'}`);
      }
    } catch (e: any) {
      setCacheMessage(`Error: ${e.message || 'Network error'}`);
    } finally {
      setClearingCache(false);
    }
  };

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
          referralRewardPremium: Number(d.referralRewardPremium ?? 25000),
          maxReferralReward: d.maxReferralReward ? Number(d.maxReferralReward) : undefined,
          milestoneVaultRewards: Array.isArray(d.milestoneVaultRewards) && d.milestoneVaultRewards.length === 4
            ? d.milestoneVaultRewards
            : [
                { target: 3, reward: 25000 },
                { target: 10, reward: 100000 },
                { target: 25, reward: 250000 },
                { target: 50, reward: 500000 },
              ],
          withdrawalEnabled: d.withdrawalEnabled !== false,
          withdrawalMinimum: Number(d.withdrawalMinimum ?? d.minWithdrawal ?? 100000),
          withdrawalMaximum: d.withdrawalMaximum ? Number(d.withdrawalMaximum) : 50000000,
          withdrawalCooldownHours: d.withdrawalCooldownHours ? Number(d.withdrawalCooldownHours) : 24,
          adEnabled: d.adEnabled !== false,
          adProvider: d.adProvider || 'monetag',
          adReward: Number(d.adReward ?? 1000),
          adDailyLimit: Number(d.adDailyLimit ?? 20),
          adBundleLimit: Number(d.adBundleLimit ?? 20),
          adBundleReward: Number(d.adBundleReward ?? 50000),
          adCooldownSeconds: Number(d.adCooldownSeconds ?? 30),
          adZoneId: String(d.adZoneId || '11886923'),
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

  const handleMilestoneChange = (index: number, field: 'target' | 'reward', val: number) => {
    const updated = [...(settings.milestoneVaultRewards || [
      { target: 3, reward: 25000 },
      { target: 10, reward: 100000 },
      { target: 25, reward: 250000 },
      { target: 50, reward: 500000 },
    ])];
    updated[index] = { ...updated[index], [field]: Math.max(1, val) };
    setSettings({ ...settings, milestoneVaultRewards: updated });
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const payload = {
        dailyCheckinRewards: settings.dailyCheckinRewards.map(Number),
        referralEnabled: Boolean(settings.referralEnabled),
        referralReward: Number(settings.referralReward),
        referralRewardPremium: Number(settings.referralRewardPremium ?? 25000),
        milestoneVaultRewards: settings.milestoneVaultRewards || [
          { target: 3, reward: 25000 },
          { target: 10, reward: 100000 },
          { target: 25, reward: 250000 },
          { target: 50, reward: 500000 },
        ],
        withdrawalEnabled: Boolean(settings.withdrawalEnabled),
        withdrawalMinimum: Number(settings.withdrawalMinimum),
        withdrawalMaximum: Number(settings.withdrawalMaximum || 50000000),
        withdrawalCooldownHours: Number(settings.withdrawalCooldownHours || 24),
        adEnabled: Boolean(settings.adEnabled),
        adProvider: String(settings.adProvider || 'monetag'),
        adReward: Number(settings.adReward || 1000),
        adDailyLimit: Number(settings.adDailyLimit || 20),
        adBundleLimit: Number(settings.adBundleLimit || 20),
        adBundleReward: Number(settings.adBundleReward || 50000),
        adCooldownSeconds: Number(settings.adCooldownSeconds || 30),
        adZoneId: String(settings.adZoneId || '11886923'),
        spinDailyLimit: Number(settings.spinDailyLimit || 5),
        maintenanceMode: Boolean(settings.maintenanceMode),
      };

      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSaveMessage('All settings saved successfully! Propagated to User App in real-time.');
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
            <SettingsIcon size={24} color="#facc15" /> Platform Economy &amp; Game Configuration
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
            Control $FEAST daily streak rewards, Monetag ad surge bundles, lucky spin caps, Telegram Premium referral rewards, and milestone vaults.
          </p>
        </div>
        <button
          className="admin-button admin-button-primary"
          onClick={saveSettings}
          disabled={saving}
          style={{ padding: '10px 22px', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <SaveIcon size={16} /> {saving ? 'Saving...' : 'Save All Changes'}
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

      {/* Global Cache Invalidation Card */}
      <div
        className="admin-card"
        style={{
          border: '1.5px solid rgba(239, 68, 68, 0.4)',
          background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
          marginBottom: '20px',
          borderRadius: '16px',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 6px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrashIcon size={18} color="#f87171" /> Global Cache Invalidation (All Users)
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, maxWidth: '680px', lineHeight: 1.5 }}>
              Purge server memory caches and increment the system-wide cache version. All active user devices across Telegram will instantly wipe their local storage cache (stored balances, pending taps, cards) on their next interaction and re-fetch fresh authoritative state from Firestore.
            </p>
            {cacheMessage && (
              <p style={{ margin: '8px 0 0', fontSize: '13px', fontWeight: 700, color: cacheMessage.startsWith('All') ? '#34d399' : '#f87171' }}>
                {cacheMessage}
              </p>
            )}
          </div>

          <button
            type="button"
            className="admin-button"
            disabled={clearingCache}
            onClick={handleClearAllUsersCache}
            style={{
              background: clearingCache ? 'rgba(239, 68, 68, 0.5)' : '#ef4444',
              color: '#ffffff',
              fontWeight: 900,
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              cursor: clearingCache ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <TrashIcon size={16} color="#ffffff" />
            {clearingCache ? 'Wiping Cache...' : 'Wipe All Users Cache'}
          </button>
        </div>
      </div>

      {/* 1. Daily Check-in Streak Rewards */}
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DailyActivitiesIcon size={18} color="#a78bfa" /> 7-Day Streak Check-in Rewards ($FEAST Points)
        </h3>
        <p style={{ color: '#8b949e', fontSize: '13px', margin: '0 0 16px' }}>
          Configure $FEAST granted to players for each consecutive day of check-in:
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
              <span style={{ fontSize: '10px', color: '#8b949e', marginTop: '4px', display: 'block' }}>$FEAST</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. In-App Monetag Ads Configuration & Mega Sponsor Surge Bundle */}
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <VideoIcon size={18} color="#38bdf8" /> Monetag Ads &amp; Mega Sponsor Surge Bundle
            </h3>
            <p style={{ color: '#8b949e', fontSize: '13px', margin: 0 }}>
              Configure video ad quotas, bundle collection reward, and cooldown delays between ads.
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
              Users watch Rewarded Interstitials to fulfill the Mega Sponsor Surge bundle and extra spins.
            </p>
          </div>

          <div>
            <label className="admin-label">Mega Surge Bundle Ads Quota (e.g. 20)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.adBundleLimit ?? 20}
              onChange={(e) => setSettings({ ...settings, adBundleLimit: Number(e.target.value), adDailyLimit: Number(e.target.value) })}
              min="1"
              max="50"
            />
            <p style={{ color: '#8b949e', fontSize: '11px', marginTop: '4px' }}>
              Total ads player must watch (e.g. 20/20) before COLLECT REWARD button unlocks.
            </p>
          </div>

          <div>
            <label className="admin-label">Full Bundle Completion Reward ($FEAST)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.adBundleReward ?? 50000}
              onChange={(e) => setSettings({ ...settings, adBundleReward: Number(e.target.value) })}
              min="1000"
              step="5000"
            />
            <p style={{ color: '#8b949e', fontSize: '11px', marginTop: '4px' }}>
              Lump-sum reward collected strictly once the full 20/20 quota is completed.
            </p>
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
            <p style={{ color: '#8b949e', fontSize: '11px', marginTop: '4px' }}>
              Wait time required between individual ad watches (default: 30s).
            </p>
          </div>

          <div>
            <label className="admin-label">Monetag Zone ID / Ad Tag</label>
            <input
              type="text"
              className="admin-input"
              value={settings.adZoneId ?? '11886923'}
              onChange={(e) => setSettings({ ...settings, adZoneId: e.target.value })}
              placeholder="11886923"
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* 3. Referral Program & Telegram Premium & Milestone Vaults */}
        <div className="admin-card" style={{ margin: 0 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 12px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UsersIcon size={18} color="#38bdf8" /> Referrals, Premium &amp; Milestone Vaults
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
            <label className="admin-label">Reward Per Direct Regular Referral ($FEAST)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.referralReward}
              onChange={(e) => setSettings({ ...settings, referralReward: Number(e.target.value) })}
              min="0"
              step="500"
            />
            <p style={{ color: '#8b949e', fontSize: '11px', marginTop: '4px' }}>
              Awarded when a regular friend joins via referral link (default: 5,000 $FEAST).
            </p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <StarIcon size={15} color="#facc15" /> Reward Per Telegram Premium Referral (5X Boost!)
            </label>
            <input
              type="number"
              className="admin-input"
              value={settings.referralRewardPremium ?? 25000}
              onChange={(e) => setSettings({ ...settings, referralRewardPremium: Number(e.target.value) })}
              min="0"
              step="1000"
            />
            <p style={{ color: '#8b949e', fontSize: '11px', marginTop: '4px' }}>
              Special high reward for Telegram Premium frens to drive premium conversion (default: 25,000 $FEAST).
            </p>
          </div>

          {/* Milestone Vault Targets Configuration */}
          <div style={{ marginTop: '16px', borderTop: '1px solid #1e293b', paddingTop: '12px' }}>
            <label className="admin-label" style={{ fontWeight: 800, color: '#fde047', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GiftIcon size={15} color="#fde047" /> Milestone Vault Chests (4 Targets &amp; Rewards)
            </label>
            <p style={{ color: '#8b949e', fontSize: '11px', margin: '2px 0 10px' }}>
              Configure required friend invites and $FEAST rewards for the 4 Milestone Vaults:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {(settings.milestoneVaultRewards || [
                { target: 3, reward: 25000 },
                { target: 10, reward: 100000 },
                { target: 25, reward: 250000 },
                { target: 50, reward: 500000 },
              ]).map((m, idx) => (
                <div key={idx} style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', marginBottom: '6px' }}>
                    Vault {idx + 1}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>Target Frens</span>
                      <input
                        type="number"
                        className="admin-input"
                        value={m.target}
                        onChange={(e) => handleMilestoneChange(idx, 'target', Number(e.target.value))}
                        style={{ margin: 0, padding: '4px 6px', fontSize: '12px' }}
                        min="1"
                      />
                    </div>
                    <div style={{ flex: 1.2 }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>Reward ($FEAST)</span>
                      <input
                        type="number"
                        className="admin-input"
                        value={m.reward}
                        onChange={(e) => handleMilestoneChange(idx, 'reward', Number(e.target.value))}
                        style={{ margin: 0, padding: '4px 6px', fontSize: '12px' }}
                        step="5000"
                        min="1000"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-form-group" style={{ marginTop: '16px' }}>
            <label className="admin-label">Lucky Spin Daily Ad Limit</label>
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
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 12px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WithdrawalsIcon size={18} color="#34d399" /> Withdrawal &amp; Payout Rules
          </h3>
          
          <div style={{ marginBottom: '14px' }}>
            <label className="admin-label" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.withdrawalEnabled}
                onChange={(e) => setSettings({ ...settings, withdrawalEnabled: e.target.checked })}
              />
              <span>Allow Chef Withdrawals</span>
            </label>
            <p style={{ color: '#8b949e', fontSize: '11px', margin: '4px 0 0 20px' }}>
              Uncheck to pause all withdrawal requests in the user app.
            </p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Minimum Withdrawal Threshold ($FEAST)</label>
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
            <label className="admin-label">Maximum Single Withdrawal ($FEAST)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.withdrawalMaximum || 50000000}
              onChange={(e) => setSettings({ ...settings, withdrawalMaximum: Number(e.target.value) })}
              min="10000"
              step="1000000"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ClockIcon size={15} color="#94a3b8" /> Withdrawal Cooldown (Hours)
            </label>
            <input
              type="number"
              className="admin-input"
              value={settings.withdrawalCooldownHours || 24}
              onChange={(e) => setSettings({ ...settings, withdrawalCooldownHours: Number(e.target.value) })}
              min="0"
              step="1"
            />
            <p style={{ color: '#8b949e', fontSize: '11px', marginTop: '4px' }}>
              Mandatory cooldown delay required between consecutive user payouts (default: 24h).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
