import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { FieldValue } from 'firebase-admin/firestore';
import {
  autoCalculateCardMetrics,
} from '@/lib/mining-cards';
import { getDynamicMiningCardsMap } from '@/lib/mining-cards-server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const { id } = await params;
    const cardsMap = await getDynamicMiningCardsMap();
    const card = cardsMap[id];

    if (!card) {
      return badRequest('Mining card not found');
    }

    return NextResponse.json({ success: true, data: card, card });
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { name, icon, baseCost, category, emoji, description, active } = body;

    const cardsMap = await getDynamicMiningCardsMap();
    const existing = cardsMap[id] || {};

    const updatedCard = autoCalculateCardMetrics({
      id,
      name: name || existing.name || id,
      icon: icon || existing.icon || '/icons/take_copter.png',
      baseCost: baseCost !== undefined ? Number(baseCost) : (existing.baseCost || 100),
      category: category || existing.category || 'Gadgets',
      emoji: emoji || existing.emoji,
      description: description || existing.description,
      active: active !== undefined ? Boolean(active) : (existing as any).active !== false,
    });

    await adminDb.collection('miningCards').doc(id).set({
      ...updatedCard,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: admin.username || 'admin',
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: `Card '${updatedCard.name}' updated successfully`,
      data: updatedCard,
      card: updatedCard,
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const { id } = await params;
    await adminDb.collection('miningCards').doc(id).set({
      active: false,
      deletedAt: FieldValue.serverTimestamp(),
      deletedBy: admin.username || 'admin',
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: `Card '${id}' deactivated successfully`,
    });
  } catch (error) {
    return serverError(error);
  }
}
