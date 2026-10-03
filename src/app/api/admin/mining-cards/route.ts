import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { FieldValue } from 'firebase-admin/firestore';
import {
  autoCalculateCardMetrics,
  getDynamicMiningCards,
} from '@/lib/mining-cards';

export async function GET(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const cards = await getDynamicMiningCards();
    return NextResponse.json({
      success: true,
      data: cards,
      cards,
      total: cards.length,
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const body = await request.json().catch(() => ({}));
    const { name, icon, baseCost, id, category, emoji, description, active } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return badRequest('Card name is required');
    }
    if (!icon || typeof icon !== 'string' || !icon.trim()) {
      return badRequest('Card icon (image URL or /icons/... path) is required');
    }
    if (baseCost === undefined || isNaN(Number(baseCost)) || Number(baseCost) <= 0) {
      return badRequest('Valid 1st level baseCost (price) is required');
    }

    const calculatedCard = autoCalculateCardMetrics({
      id,
      name,
      icon,
      baseCost: Number(baseCost),
      category,
      emoji,
      description,
      active: active !== undefined ? Boolean(active) : true,
    });

    const cardId = calculatedCard.id;
    await adminDb.collection('miningCards').doc(cardId).set({
      ...calculatedCard,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: admin.username || 'admin',
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: `Card '${calculatedCard.name}' configured with auto-calculations`,
      data: calculatedCard,
      card: calculatedCard,
    });
  } catch (error) {
    return serverError(error);
  }
}
