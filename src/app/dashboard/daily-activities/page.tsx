'use client';

import React, { useState, useEffect } from 'react';

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
}

interface ComboData {
  cards: string[];
  allCards: ComboCard[];
  rewardAmount: number;
  date: string;
}

export default function DailyActivitiesAdminPage() {
  // Cipher State
  const [cipher, setCipher] = useState<CipherData>({
    word: 'REWARDS',
    rewardAmount: 500,
    hint: 'Telegram Web3 Mystery Code',
    date: '',
  });
  const [savingCipher, setSavingCipher] = useState(false);
  const [cipherMsg, setCipherMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Combo State
  const [combo, setCombo] = useState<ComboData>({
    cards: ['crypto_bot', 'viral_meme', 'ton_bridge'],
    allCards: [],
    rewardAmount: 1000,
    date: '',
  });
  const [savingCombo, setSavingCombo] = useState(false);
  const [comboMsg, setComboMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
          // Replace last
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

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
        <p>Loading Daily Activities Control...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.3rem', color: '#f8fafc' }}>
          Daily Viral Activities Manager
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
          Configure Daily Secret Cipher codes & 3-Card Combo puzzles to drive viral Telegram retention.
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
                Daily Secret Cipher
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#60a5fa' }}>Hamster Kombat style Morse Puzzle</span>
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
                onChange={(e) => setCipher({ ...cipher, word: e.target.value.toUpperCase() })}
                placeholder="e.g. REWARDS, LUCKY, AIRDROP, CRYPTO"
                required
                style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Word Length: <b>{cipher.word.length} Letters</b>
              </span>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Reward Points (PTS)</label>
              <input
                type="number"
                className="admin-input"
                value={cipher.rewardAmount}
                onChange={(e) => setCipher({ ...cipher, rewardAmount: Number(e.target.value) })}
                required
                min={10}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Hint (Optional)</label>
              <input
                type="text"
                className="admin-input"
                value={cipher.hint}
                onChange={(e) => setCipher({ ...cipher, hint: e.target.value })}
                placeholder="e.g. Web3 Mining terminology"
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
                Daily 3-Card Combo
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Select today&apos;s 3 mystery cards</span>
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
            <div style={{ marginBottom: '1rem' }}>
              <label className="admin-label">
                Winning Combo Cards ({combo.cards.length} / 3 Selected):
              </label>
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
                {combo.allCards.map((card) => {
                  const isSelected = combo.cards.includes(card.id);
                  return (
                    <div
                      key={card.id}
                      onClick={() => toggleComboCard(card.id)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '6px',
                        background: isSelected ? 'rgba(245, 158, 11, 0.2)' : '#13171f',
                        border: isSelected ? '2px solid #f59e0b' : '1px solid #1e2533',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: '1.4rem' }}>{card.icon}</div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: isSelected ? '#fef08a' : '#94a3b8',
                          marginTop: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {card.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Reward Points (PTS)</label>
              <input
                type="number"
                className="admin-input"
                value={combo.rewardAmount}
                onChange={(e) => setCombo({ ...combo, rewardAmount: Number(e.target.value) })}
                required
                min={50}
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
    </div>
  );
}
