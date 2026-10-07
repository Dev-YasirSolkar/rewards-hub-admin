'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { adminFetch } from '@/lib/admin-client';
import { MiningCardDef, autoCalculateCardMetrics } from '@/lib/mining-cards';

const CATEGORIES = ['Gadgets', 'Friends', 'Future Tech', 'Specials'] as const;

// Helper to determine if an icon string is an image URL/path or an emoji
export function isImageUrl(icon?: string): boolean {
  if (!icon || typeof icon !== 'string') return false;
  const trimmed = icon.trim();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image')
  );
}

// Resilient Card Icon Renderer Component
export function CardIconRenderer({
  icon,
  emoji,
  name,
  size = 32,
}: {
  icon?: string;
  emoji?: string;
  name?: string;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);

  // Reset imgError state if icon changes
  useEffect(() => {
    setImgError(false);
  }, [icon]);

  const hasImgUrl = isImageUrl(icon) && !imgError;

  if (hasImgUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={icon}
        alt={name || 'Card Icon'}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          display: 'block',
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback: If not an image URL or image failed to load, display emoji cleanly
  const displayEmoji = (!isImageUrl(icon) && icon && icon.trim()) || emoji || '⚡';
  return (
    <span
      style={{
        fontSize: `${Math.max(14, Math.round(size * 0.72))}px`,
        lineHeight: 1,
        userSelect: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {displayEmoji}
    </span>
  );
}

// Preset Built-in Icons Available in /public/icons/
const PRESET_ICONS = [
  { name: 'Bamboo Copter', path: '/icons/take_copter.png' },
  { name: 'AI Trading Bot', path: '/icons/ai_bot.png' },
  { name: 'Crypto Bot', path: '/icons/crypto_bot.png' },
  { name: 'Airdrop Hunter', path: '/icons/airdrop_hunter.png' },
  { name: 'DEX Listing', path: '/icons/dex_listing.png' },
  { name: 'CEX Listing', path: '/icons/cex_listing.png' },
  { name: 'TON Bridge', path: '/icons/ton_bridge.png' },
  { name: 'Staking Pool', path: '/icons/staking_pool.png' },
  { name: 'Smart Contract', path: '/icons/smart_contract.png' },
  { name: 'Cloud Nodes', path: '/icons/cloud_nodes.png' },
  { name: 'Metaverse Land', path: '/icons/metaverse_land.png' },
  { name: 'Telegram Channel', path: '/icons/telegram_channel.png' },
  { name: 'Telegram Boost', path: '/icons/telegram_boost.png' },
  { name: 'Influencer Collab', path: '/icons/influencer_collab.png' },
  { name: 'Turbo 2X Power', path: '/icons/turbo_2x.png' },
  { name: 'Full Tank Refill', path: '/icons/full_tank.png' },
  { name: 'Daily Reward Box', path: '/icons/daily_reward.png' },
  { name: 'VC Investment', path: '/icons/vc_investment.png' },
  { name: 'Viral Meme Token', path: '/icons/viral_meme.png' },
  { name: 'Web3 Summit', path: '/icons/web3_summit.png' },
  { name: 'Margin Trading', path: '/icons/margin_trading.png' },
  { name: 'DAO License', path: '/icons/dao_license.png' },
  { name: 'Global License', path: '/icons/global_license.png' },
  { name: 'Anti-Fraud Shield', path: '/icons/anti_fraud.png' },
  { name: 'Smart Audit', path: '/icons/smart_audit.png' },
  { name: 'VPN Tunnel', path: '/icons/vpn_tunnel.png' },
  { name: 'Fan Token', path: '/icons/fan_token.png' },
  { name: 'Partners Network', path: '/icons/partners.png' },
  { name: 'Daily Combo Hub', path: '/icons/daily_combo.png' },
  { name: 'Daily Cipher Key', path: '/icons/daily_cipher.png' },
];

export default function MiningCardsAdminPage() {
  const [cards, setCards] = useState<MiningCardDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<MiningCardDef | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [baseCost, setBaseCost] = useState('500');
  const [category, setCategory] = useState<'Gadgets' | 'Friends' | 'Future Tech' | 'Specials'>('Gadgets');
  const [active, setActive] = useState(true);

  // Icon Input Mode: 'presets' | 'file' | 'url'
  const [iconInputMode, setIconInputMode] = useState<'presets' | 'file' | 'url'>('presets');
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/mining-cards');
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data as any).cards || [];
        setCards(list);
      }
    } catch (e) {
      console.error('Failed to fetch cards:', e);
    }
    setLoading(false);
  };

  // Live Auto-Calculation Preview based on current inputs
  const livePreview = useMemo(() => {
    const costNum = Math.max(10, parseInt(baseCost, 10) || 100);
    return autoCalculateCardMetrics({
      name: name || 'Preview Card',
      icon: icon || '/icons/take_copter.png',
      baseCost: costNum,
      category,
    });
  }, [name, icon, baseCost, category]);

  const openCreateModal = () => {
    setEditingCard(null);
    setName('');
    setIcon('/icons/take_copter.png');
    setBaseCost('500');
    setCategory('Gadgets');
    setActive(true);
    setMessage(null);
    setUploadedFileName('');
    setIconInputMode('presets');
    setShowModal(true);
  };

  const openEditModal = (card: MiningCardDef) => {
    setEditingCard(card);
    setName(card.name);
    setIcon(card.icon);
    setBaseCost(card.baseCost.toString());
    setCategory(card.category || 'Gadgets');
    setActive((card as any).active !== false);
    setMessage(null);
    setUploadedFileName('');
    if (card.icon.startsWith('data:')) {
      setIconInputMode('file');
      setUploadedFileName('Custom Uploaded File');
    } else if (card.icon.startsWith('http')) {
      setIconInputMode('url');
    } else {
      setIconInputMode('presets');
    }
    setShowModal(true);
  };

  // Handle local image file selection from file manager
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPG, SVG, WebP)' });
      return;
    }

    setFileUploading(true);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress & resize image to max 256x256 canvas to keep payload small & ultra-fast
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.9);
          setIcon(dataUrl);
          setMessage({ type: 'success', text: `📁 Icon "${file.name}" loaded successfully from device!` });
        } else {
          setIcon(event.target?.result as string);
        }
        setFileUploading(false);
      };
      img.onerror = () => {
        setMessage({ type: 'error', text: 'Failed to process image file' });
        setFileUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Failed to read file from device' });
      setFileUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Card name is required' });
      return;
    }
    if (!icon.trim()) {
      setMessage({ type: 'error', text: 'Card icon is required (Pick from presets, upload file, or enter URL)' });
      return;
    }
    const costNum = parseInt(baseCost, 10);
    if (isNaN(costNum) || costNum <= 0) {
      setMessage({ type: 'error', text: '1st level base cost must be a positive number' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        id: editingCard ? editingCard.id : undefined,
        name: name.trim(),
        icon: icon.trim(),
        baseCost: costNum,
        category,
        active,
      };

      const res = await adminFetch(
        editingCard ? `/api/admin/mining-cards/${editingCard.id}` : '/api/admin/mining-cards',
        {
          method: editingCard ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      );

      if (res.success) {
        setMessage({ type: 'success', text: `Card '${name}' saved successfully with icon & auto-calculations!` });
        setTimeout(() => {
          setShowModal(false);
          fetchCards();
        }, 800);
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to save card' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, cardName: string) => {
    if (!confirm(`Are you sure you want to deactivate '${cardName}'?`)) return;
    try {
      const res = await adminFetch(`/api/admin/mining-cards/${id}`, { method: 'DELETE' });
      if (res.success) {
        fetchCards();
      } else {
        alert(res.error || 'Failed to deactivate card');
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting card');
    }
  };

  const filteredCards = cards.filter((c) => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              margin: '0 0 6px',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>⛏️</span> Mining Cards Configuration
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            Configure cards with <b>Preset Icons</b>, <b>Local File Uploads</b>, or <b>Web URLs</b>. Multipliers, hourly
            profit, and tier requirements are calculated automatically.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="admin-btn admin-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 700 }}
        >
          <span>➕</span> Add New Card
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Cards
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            {cards.length}
          </div>
        </div>
        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Gadgets Category
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
            {cards.filter((c) => c.category === 'Gadgets').length}
          </div>
        </div>
        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Friends Category
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f472b6', marginTop: '4px' }}>
            {cards.filter((c) => c.category === 'Friends').length}
          </div>
        </div>
        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Icon Engine
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fde047', marginTop: '4px' }}>
            📁 Upload + URL + Presets
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="admin-card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`admin-btn ${selectedCategory === 'all' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
            >
              All ({cards.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`admin-btn ${selectedCategory === cat ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '6px 14px' }}
              >
                {cat} ({cards.filter((c) => c.category === cat).length})
              </button>
            ))}
          </div>

          <div style={{ minWidth: '240px' }}>
            <input
              type="text"
              placeholder="🔍 Search cards by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input"
              style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px' }}
            />
          </div>
        </div>
      </div>

      {/* Cards Table */}
      <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
            Loading mining cards...
          </div>
        ) : filteredCards.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            No mining cards found matching filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <th style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Card &amp; Icon
                  </th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Category
                  </th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    1st Level Price
                  </th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Hourly Profit
                  </th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Multipliers
                  </th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Unlock Tier
                  </th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card) => (
                  <tr key={card.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: 'radial-gradient(circle, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%)',
                            border: '1.5px solid rgba(255, 255, 255, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                          }}
                        >
                          <CardIconRenderer icon={card.icon} emoji={card.emoji} name={card.name} size={32} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>{card.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {card.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          background:
                            card.category === 'Gadgets'
                              ? 'rgba(56, 189, 248, 0.15)'
                              : card.category === 'Friends'
                              ? 'rgba(236, 72, 153, 0.15)'
                              : card.category === 'Future Tech'
                              ? 'rgba(234, 179, 8, 0.15)'
                              : 'rgba(168, 85, 247, 0.15)',
                          color:
                            card.category === 'Gadgets'
                              ? '#38bdf8'
                              : card.category === 'Friends'
                              ? '#f472b6'
                              : card.category === 'Future Tech'
                              ? '#fde047'
                              : '#c084fc',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        {card.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#fbbf24' }}>
                      {card.baseCost.toLocaleString()} PTS
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#34d399' }}>
                      +{card.baseProfit.toLocaleString()} PTS/h
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                      <div style={{ color: '#cbd5e1' }}>
                        Cost: <b style={{ color: '#f59e0b' }}>{card.costMult}x</b>
                      </div>
                      <div style={{ color: '#cbd5e1' }}>
                        Profit: <b style={{ color: '#10b981' }}>{card.profitMult}x</b>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: 'rgba(30, 41, 59, 0.8)',
                          color: '#94a3b8',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        Tier {card.requiredLevel}/7
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(card)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(card.id, card.name)}
                          className="admin-btn"
                          style={{
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ────────────────────────────────────────── */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            className="admin-card"
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '24px',
              position: 'relative',
              borderRadius: '18px',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.9)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '12px',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>
                {editingCard ? '✏️ Edit Mining Card' : '➕ Add New Mining Card'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {message && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: message.type === 'success' ? '1px solid #10b981' : '1px solid #ef4444',
                  color: message.type === 'success' ? '#34d399' : '#fca5a5',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Card Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    Card Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anywhere Door, Crypto Bot, Time Machine"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="admin-input"
                    style={{ width: '100%', fontSize: '0.95rem' }}
                  />
                </div>

                {/* 2. CARD ICON SELECTOR (File Manager Upload + Presets + Direct URL) */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', margin: 0 }}>
                      🖼️ Card Icon Selector *
                    </label>

                    {/* Mode Selector Tabs */}
                    <div style={{ display: 'flex', gap: '4px', background: '#090d16', padding: '3px', borderRadius: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setIconInputMode('presets')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: iconInputMode === 'presets' ? '#38bdf8' : 'transparent',
                          color: iconInputMode === 'presets' ? '#000' : '#94a3b8',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ Presets
                      </button>
                      <button
                        type="button"
                        onClick={() => setIconInputMode('file')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: iconInputMode === 'file' ? '#38bdf8' : 'transparent',
                          color: iconInputMode === 'file' ? '#000' : '#94a3b8',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        📁 File Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setIconInputMode('url')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: iconInputMode === 'url' ? '#38bdf8' : 'transparent',
                          color: iconInputMode === 'url' ? '#000' : '#94a3b8',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        🔗 Image URL
                      </button>
                    </div>
                  </div>

                  {/* Hidden Real File Input for File Manager */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />

                  {/* ── OPTION A: PRESET ICONS GRID ── */}
                  {iconInputMode === 'presets' && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>
                        Click any built-in gadget icon to select:
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(6, 1fr)',
                          gap: '8px',
                          maxHeight: '160px',
                          overflowY: 'auto',
                          padding: '6px',
                          background: '#090d16',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        {PRESET_ICONS.map((p) => {
                          const isSelected = icon === p.path;
                          return (
                            <button
                              key={p.path}
                              type="button"
                              onClick={() => {
                                setIcon(p.path);
                                setUploadedFileName('');
                              }}
                              title={p.name}
                              style={{
                                padding: '6px',
                                borderRadius: '8px',
                                background: isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.5)',
                                border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <CardIconRenderer icon={p.path} name={p.name} size={28} />
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  color: isSelected ? '#38bdf8' : '#cbd5e1',
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  width: '100%',
                                  textAlign: 'center',
                                }}
                              >
                                {p.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── OPTION B: FILE UPLOAD FROM DEVICE / FILE MANAGER ── */}
                  {iconInputMode === 'file' && (
                    <div
                      style={{
                        padding: '16px',
                        background: '#090d16',
                        borderRadius: '10px',
                        border: '1.5px dashed rgba(56, 189, 248, 0.4)',
                        textAlign: 'center',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={fileUploading}
                        className="admin-btn admin-btn-primary"
                        style={{
                          padding: '10px 20px',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        <span>📁</span> {fileUploading ? 'Processing File...' : 'Choose File from File Manager / Device'}
                      </button>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
                        Supports PNG, JPG, WebP, SVG (Auto-optimized for instant loading)
                      </div>
                      {uploadedFileName && (
                        <div
                          style={{
                            marginTop: '10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                          }}
                        >
                          <span>✓ Active File:</span> <span>{uploadedFileName}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── OPTION C: DIRECT IMAGE URL OR EMOJI ── */}
                  {iconInputMode === 'url' && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
                        Paste any external image URL (e.g. https://domain.com/icon.png) or emoji:
                      </div>
                      <input
                        type="text"
                        placeholder="https://... or /icons/custom.png or 🚀"
                        value={icon}
                        onChange={(e) => {
                          setIcon(e.target.value);
                          setUploadedFileName('');
                        }}
                        className="admin-input"
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>
                  )}

                  {/* LIVE ICON PREVIEW FOOTER */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'radial-gradient(circle, #1e293b 0%, #0b1120 100%)',
                        border: '2px solid #38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                        boxShadow: '0 0 12px rgba(56, 189, 248, 0.35)',
                      }}
                    >
                      <CardIconRenderer icon={icon || '/icons/take_copter.png'} name={name} size={32} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f8fafc' }}>
                        Active Icon Source:
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: '#94a3b8',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {icon.startsWith('data:')
                          ? '📁 Uploaded Base64 Data URL'
                          : isImageUrl(icon)
                          ? icon
                          : `Emoji: ${icon || '⚡'}`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. 1st Level Price (Base Cost) & Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                      1st Level Cost Price (PTS) *
                    </label>
                    <input
                      type="number"
                      required
                      min="10"
                      step="10"
                      placeholder="500"
                      value={baseCost}
                      onChange={(e) => setBaseCost(e.target.value)}
                      className="admin-input"
                      style={{ width: '100%', color: '#fde047', fontWeight: 800, fontSize: '0.95rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="admin-input"
                      style={{ width: '100%', fontSize: '0.95rem' }}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── LIVE AUTO-CALCULATION INTELLIGENCE BOX ── */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
                    border: '1.5px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    marginTop: '2px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1rem' }}>🤖</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Auto-Calculated Engine Metrics (Preview)
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '8px',
                      textAlign: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Base Profit</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399' }}>+{livePreview.baseProfit}/h</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Cost Multiplier</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fbbf24' }}>{livePreview.costMult}x</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Profit Multiplier</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#60a5fa' }}>{livePreview.profitMult}x</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Unlock Tier</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f472b6' }}>Tier {livePreview.requiredLevel}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    • <b>Lv. 1:</b> Cost {livePreview.baseCost.toLocaleString()} PTS ➔ +{livePreview.baseProfit} PTS/h<br />
                    • <b>Lv. 2:</b> Cost {Math.floor(livePreview.baseCost * livePreview.costMult).toLocaleString()} PTS ➔ +
                    {Math.floor(livePreview.baseProfit * livePreview.profitMult)} PTS/h<br />
                    • <b>Lv. 3:</b> Cost {Math.floor(livePreview.baseCost * Math.pow(livePreview.costMult, 2)).toLocaleString()} PTS ➔ +
                    {Math.floor(livePreview.baseProfit * Math.pow(livePreview.profitMult, 2))} PTS/h
                  </div>
                </div>

                {/* Submit & Cancel Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="admin-btn admin-btn-secondary"
                    style={{ padding: '10px 18px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || fileUploading}
                    className="admin-btn admin-btn-primary"
                    style={{ padding: '10px 24px', fontWeight: 800 }}
                  >
                    {submitting ? 'Saving Card...' : editingCard ? 'Save Changes' : 'Create Mining Card'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
