'use client';

import React, { useState, useEffect } from 'react';

const MORSE_TABLE: Record<string, string> = {
  A: '• —', B: '— • • •', C: '— • — •', D: '— • •',
  E: '•', F: '• • — •', G: '— — •', H: '• • • •',
  I: '• •', J: '• — — —', K: '— • —', L: '• — • •',
  M: '— —', N: '— •', O: '— — —', P: '• — — •',
  Q: '— — • —', R: '• — •', S: '• • •', T: '—',
  U: '• • —', V: '• • • —', W: '• — —', X: '— • • —',
  Y: '— • — —', Z: '— — • •', '0': '— — — — —',
  '1': '• — — — —', '2': '• • — — —', '3': '• • • — —',
  '4': '• • • • —', '5': '• • • • •', '6': '— • • • •',
  '7': '— — • • •', '8': '— — — • •', '9': '— — — — •',
};

interface CipherData {
  word: string;
  rewardAmount: number;
  hint: string;
  date: string;
}

interface ComboCard {
  id: string;
  name: string;
  category: string;
  icon: string;
  emoji?: string;
  baseProfit?: number;
  requiredLevel?: number;
}

interface ComboData {
  cards: string[];
  allCards: ComboCard[];
  rewardAmount: number;
  date: string;
}

const PRESET_CIPHERS = ['DORAEMON', 'NOBITA', 'SHIZUKA', 'SUNEO', 'GIAN', 'DORAMI', 'DORACOIN', 'GADGET', 'FUTURE', 'AIRDROP', 'POCKET', 'DORACAKE'];

export default function DailyActivitiesAdminPage() {
  // Cipher State
  const [cipher, setCipher] = useState<CipherData>({
    word: 'DORAEMON',
    rewardAmount: 1000000,
    hint: '22nd Century Robotic Cat Miner',
    date: '',
  });
  const [savingCipher, setSavingCipher] = useState(false);
  const [cipherMsg, setCipherMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Combo State
  const [combo, setCombo] = useState<ComboData>({
    cards: ['fan_token', 'staking_pool', 'dex_listing'],
    allCards: [],
    rewardAmount: 5000000,
    date: '',
  });
  const [savingCombo, setSavingCombo] = useState(false);
  const [comboMsg, setComboMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [cipherRes, comboRes] = await Promise.all([
        fetch('/api/admin/cipher').then((r) => r.json()),
        fetch('/api/admin/combo').then((r) => r.json()),
      ]);

      if (cipherRes.success && cipherRes.data) {
        setCipher(cipherRes.data);
      }
      if (comboRes.success && comboRes.data) {
        setCombo(comboRes.data);
      }
    } catch (e) {
      console.error('Failed to load daily activities', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCipher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCipher(true);
    setCipherMsg(null);

    try {
      const res = await fetch('/api/admin/cipher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cipher),
      });
      const data = await res.json();

      if (data.success) {
        setCipherMsg({ type: 'success', text: `✅ Daily Cipher updated to "${cipher.word.toUpperCase()}"!` });
      } else {
        setCipherMsg({ type: 'error', text: data.error?.message || 'Failed to update cipher' });
      }
    } catch {
      setCipherMsg({ type: 'error', text: 'Network error updating cipher' });
    } finally {
      setSavingCipher(false);
    }
  };

  const toggleComboCard = (cardId: string) => {
    setCombo((prev) => {
      const isSelected = prev.cards.includes(cardId);
      if (isSelected) {
        return { ...prev, cards: prev.cards.filter((id) => id !== cardId) };
      } else {
        if (prev.cards.length >= 3) {
          // Replace oldest
          return { ...prev, cards: [...prev.cards.slice(1), cardId] };
        }
        return { ...prev, cards: [...prev.cards, cardId] };
      }
    });
  };

  const handleSaveCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (combo.cards.length !== 3) {
      setComboMsg({ type: 'error', text: 'Please select exactly 3 cards for daily combo' });
      return;
    }

    setSavingCombo(true);
    setComboMsg(null);

    try {
      const res = await fetch('/api/admin/combo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: combo.cards, rewardAmount: combo.rewardAmount }),
      });
      const data = await res.json();

      if (data.success) {
        setComboMsg({ type: 'success', text: '✅ Daily 3-Card Combo saved successfully!' });
      } else {
        setComboMsg({ type: 'error', text: data.error?.message || 'Failed to update combo' });
      }
    } catch {
      setComboMsg({ type: 'error', text: 'Network error updating combo' });
    } finally {
      setSavingCombo(false);
    }
  };

  const filteredCards = combo.allCards.filter((card) => {
    if (categoryFilter === 'all') return true;
    return card.category === categoryFilter;
  });

  const categories = Array.from(new Set(combo.allCards.map((c) => c.category || 'General')));

  if (loading) {
    return (
      <div style={{ padding: '20px 0' }}>
        <div className="skeleton-box" style={{ height: '70px', marginBottom: '16px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="skeleton-box" style={{ height: '360px' }} />
          <div className="skeleton-box" style={{ height: '360px' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.3rem', color: '#f8fafc' }}>
          Daily Secret Activities & Rewards
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
          Publish daily secret Morse code ciphers & 3-Card mining combo puzzles to keep users engaged daily.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* ======================================================== */}
        {/* 1. DAILY SECRET CIPHER FORM                              */}
        {/* ======================================================== */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🕵️</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                Daily Morse Secret Cipher
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#60a5fa' }}>Tap Screen Secret Morse Code Puzzle</span>
            </div>
          </div>

          {cipherMsg && (
            <div
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: cipherMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: cipherMsg.type === 'success' ? '#10b981' : '#ef4444',
                border: `1px solid ${cipherMsg.type === 'success' ? '#10b981' : '#ef4444'}`,
              }}
            >
              {cipherMsg.text}
            </div>
          )}

          <form onSubmit={handleSaveCipher}>
            <div className="admin-form-group">
              <label className="admin-label">Secret Cipher Word (ALL CAPS)</label>
              <input
                type="text"
                className="admin-input"
                value={cipher.word}
                onChange={(e) => setCipher({ ...cipher, word: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                placeholder="e.g. DORAEMON, NOBITA, GADGET"
                required
                style={{ textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 800, fontSize: '1.1rem' }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                {PRESET_CIPHERS.map((pw) => (
                  <button
                    key={pw}
                    type="button"
                    onClick={() => setCipher({ ...cipher, word: pw })}
                    style={{
                      background: cipher.word === pw ? '#3b82f6' : 'rgba(59, 130, 246, 0.15)',
                      color: cipher.word === pw ? '#fff' : '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {pw}
                  </button>
                ))}
              </div>
            </div>

            {/* Morse Code Live Preview Box */}
            <div
              style={{
                background: '#090d16',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>
                📡 LIVE MORSE SEQUENCE PREVIEW:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {cipher.word.split('').map((char, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#f8fafc' }}>{char}</div>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace', letterSpacing: '1px' }}>
                      {MORSE_TABLE[char] || '?'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Reward Amount (Doracakes 🥞)</label>
              <input
                type="number"
                className="admin-input"
                value={cipher.rewardAmount}
                onChange={(e) => setCipher({ ...cipher, rewardAmount: Number(e.target.value) })}
                required
                min={0}
                step="any"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Hint (Optional)</label>
              <input
                type="text"
                className="admin-input"
                value={cipher.hint}
                onChange={(e) => setCipher({ ...cipher, hint: e.target.value })}
                placeholder="e.g. 22nd Century Secret Robotic Cat"
              />
            </div>

            <button
              type="submit"
              disabled={savingCipher}
              className="admin-button admin-button-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {savingCipher ? 'Saving Cipher...' : '💾 Publish Daily Cipher'}
            </button>
          </form>
        </div>

        {/* ======================================================== */}
        {/* 2. DAILY 3-CARD COMBO FORM                               */}
        {/* ======================================================== */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🃏</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                Daily 3-Card Mining Combo
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Select today&apos;s 3 mystery gadget cards</span>
            </div>
          </div>

          {comboMsg && (
            <div
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: comboMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: comboMsg.type === 'success' ? '#10b981' : '#ef4444',
                border: `1px solid ${comboMsg.type === 'success' ? '#10b981' : '#ef4444'}`,
              }}
            >
              {comboMsg.text}
            </div>
          )}

          <form onSubmit={handleSaveCombo}>
            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: categoryFilter === 'all' ? '#f59e0b' : '#1e293b',
                  color: categoryFilter === 'all' ? '#000' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                All Cards ({combo.allCards.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: categoryFilter === cat ? '#f59e0b' : '#1e293b',
                    color: categoryFilter === cat ? '#000' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="admin-label" style={{ margin: 0 }}>
                  Winning Cards Selected:
                </label>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: combo.cards.length === 3 ? '#10b981' : '#f59e0b' }}>
                  {combo.cards.length} / 3 Selected
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  background: '#090d16',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                }}
              >
                {filteredCards.map((card) => {
                  const isSelected = combo.cards.includes(card.id);
                  return (
                    <div
                      key={card.id}
                      onClick={() => toggleComboCard(card.id)}
                      style={{
                        padding: '0.5rem 0.4rem',
                        borderRadius: '6px',
                        background: isSelected ? 'rgba(245, 158, 11, 0.25)' : '#13171f',
                        border: isSelected ? '2px solid #f59e0b' : '1px solid #1e2533',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: '1.4rem' }}>{card.emoji || '⚡'}</div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: isSelected ? '#fef08a' : '#f1f5f9',
                          marginTop: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {card.name}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: '#64748b' }}>
                        +{card.baseProfit || 0}/h
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Reward Amount (Doracakes 🥞)</label>
              <input
                type="number"
                className="admin-input"
                value={combo.rewardAmount}
                onChange={(e) => setCombo({ ...combo, rewardAmount: Number(e.target.value) })}
                required
                min={0}
                step="any"
              />
            </div>

            <button
              type="submit"
              disabled={savingCombo || combo.cards.length !== 3}
              className="admin-button admin-button-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {savingCombo ? 'Saving Combo...' : '💾 Publish 3-Card Combo'}
            </button>
          </form>
        </div>
      </div>

      {/* 3. Game Economy & Viral Features Overview */}
      <div
        className="admin-card"
        style={{
          marginTop: '1.5rem',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(15, 23, 42, 0.6))',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '12px',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🌟</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              22nd Century Doraemon Gamification Matrix
            </h3>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
            }}
          >
            ACTIVE & MONITORED
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
          <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Daily Streak Check-in</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>7-Day Ladder</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Configurable in Settings tab</div>
          </div>

          <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Dynamic Mining Cards</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#facc15', marginTop: '0.2rem' }}>{combo.allCards.length} Dynamic Gadgets</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Syncs live with user /mine screen</div>
          </div>

          <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lucky Spin Wheel</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4ade80', marginTop: '0.2rem' }}>1 Free + 5 Ad Spins</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Monetag rewarded video verification</div>
          </div>

          <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Character Tiers Evolution</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f43f5e', marginTop: '0.2rem' }}>7 Legend Characters</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Doracake $\to$ Nobita $\to$ Doraemon</div>
          </div>
        </div>
      </div>
    </div>
  );
}
