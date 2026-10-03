import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { getCached, setCached, invalidateCache } from '@/lib/cache';
import { getDynamicMiningCards } from '@/lib/mining-cards-server';

function getTodayString() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const cached = getCached<any>('admin_combo');
    if (cached) {
      return Response.json({ success: true, data: cached, cached: true });
    }

    const [doc, dynamicCards] = await Promise.all([
      adminDb.collection('adminSettings').doc('combo').get(),
      getDynamicMiningCards(),
    ]);

    const data = doc.exists ? doc.data() : {};
    const today = getTodayString();

    const fallbackCards = dynamicCards.slice(0, 3).map((c) => c.id);
    const currentCards = (data?.date === today && Array.isArray(data?.cards))
      ? data.cards
      : (data?.cards?.length === 3 ? data.cards : fallbackCards);

    const mappedAllCards = dynamicCards.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      icon: c.icon,
      emoji: c.emoji,
      baseProfit: c.baseProfit,
      requiredLevel: c.requiredLevel,
    }));

    const result = {
      cards: currentCards,
      allCards: mappedAllCards,
      rewardAmount: Number(data?.rewardAmount || 1000000),
      date: data?.date || today,
      updatedAt: data?.updatedAt || null,
    };

    setCached('admin_combo', result, 60);

    return Response.json({
      success: true,
      data: result,
      cached: false,
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
    const { cards = [], rewardAmount = 1000000 } = body;

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

    invalidateCache('admin_combo');

    return Response.json({
      success: true,
      data: updatePayload,
    });
  } catch (error) {
    console.error('Admin combo update error:', error);
    return serverError('Failed to update combo settings');
  }
}
