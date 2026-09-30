import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

const ALL_CARDS = [
  { id: 'crypto_bot', name: 'AI Trading Bot', category: 'Tech & AI', icon: '🤖' },
  { id: 'airdrop_hunter', name: 'Airdrop Hunter', category: 'Tech & AI', icon: '📡' },
  { id: 'vpn_tunnel', name: 'High-speed Node', category: 'Tech & AI', icon: '⚡' },
  { id: 'viral_meme', name: 'Viral Meme Army', category: 'Marketing', icon: '🚀' },
  { id: 'influencer', name: 'Crypto Influencer', category: 'Marketing', icon: '🎙️' },
  { id: 'telegram_boost', name: 'Telegram Booster', category: 'Marketing', icon: '💎' },
  { id: 'dao_license', name: 'Global DAO License', category: 'Web3 & Legal', icon: '📜' },
  { id: 'anti_fraud', name: 'Security Shield', category: 'Web3 & Legal', icon: '🛡️' },
  { id: 'smart_contract', name: 'Audited Contract', category: 'Web3 & Legal', icon: '🔐' },
  { id: 'ton_bridge', name: 'TON Network Bridge', category: 'Tech & AI', icon: '🌉' },
  { id: 'staking_pool', name: 'VIP Liquidity Pool', category: 'Marketing', icon: '🏦' },
  { id: 'metaverse_land', name: 'Virtual Headquarters', category: 'Web3 & Legal', icon: '🏛️' },
];

function getTodayString() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const doc = await adminDb.collection('adminSettings').doc('combo').get();
    const data = doc.exists ? doc.data() : {};
    const today = getTodayString();

    const currentCards = (data?.date === today && Array.isArray(data?.cards))
      ? data.cards
      : ['crypto_bot', 'viral_meme', 'ton_bridge'];

    return Response.json({
      success: true,
      data: {
        cards: currentCards,
        allCards: ALL_CARDS,
        rewardAmount: Number(data?.rewardAmount || 1000),
        date: data?.date || today,
        updatedAt: data?.updatedAt || null,
      },
    });
  } catch (error) {
    console.error('Admin combo get error:', error);
    return serverError('Failed to fetch combo settings');
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const body = await request.json();
    const { cards = [], rewardAmount = 1000 } = body;

    if (!Array.isArray(cards) || cards.length !== 3) {
      return badRequest('Exactly 3 card IDs must be selected for daily combo');
    }

    const today = getTodayString();

    const updatePayload = {
      cards,
      rewardAmount: Number(rewardAmount),
      date: today,
      updatedAt: new Date().toISOString(),
      updatedBy: admin.username || admin.id,
    };

    await adminDb.collection('adminSettings').doc('combo').set(updatePayload, { merge: true });

    await createAuditLog({
      performedBy: admin.id,
      action: 'UPDATE_DAILY_COMBO',
      targetId: 'combo',
      targetType: 'adminSettings',
      details: { cards, rewardAmount, date: today },
    });

    return Response.json({
      success: true,
      data: updatePayload,
    });
  } catch (error) {
    console.error('Admin combo update error:', error);
    return serverError('Failed to update combo settings');
  }
}
