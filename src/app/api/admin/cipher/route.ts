import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError, badRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { getCached, setCached, invalidateCache } from '@/lib/cache';

function getTodayString() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const cached = getCached<any>('admin_cipher');
    if (cached) {
      return Response.json({ success: true, data: cached, cached: true });
    }

    const doc = await adminDb.collection('adminSettings').doc('cipher').get();
    const data = doc.exists ? doc.data() : {};
    const today = getTodayString();

    const result = {
      word: data?.word || 'REWARDS',
      rewardAmount: Number(data?.rewardAmount || 500),
      hint: data?.hint || 'Telegram Web3 Mystery Code',
      date: data?.date || today,
      updatedAt: data?.updatedAt || null,
    };

    setCached('admin_cipher', result, 60);

    return Response.json({
      success: true,
      data: result,
      cached: false,
    });
  } catch (error) {
    console.error('Admin cipher get error:', error);
    return serverError('Failed to fetch cipher settings');
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const body = await request.json();
    const { word, rewardAmount = 500, hint = '' } = body;

    if (!word || typeof word !== 'string') {
      return badRequest('Cipher word is required');
    }

    const cleanWord = word.trim().toUpperCase();
    const today = getTodayString();

    const updatePayload = {
      word: cleanWord,
      rewardAmount: Number(rewardAmount),
      hint: hint.trim(),
      date: today,
      updatedAt: new Date().toISOString(),
      updatedBy: admin.username || admin.id,
    };

    await adminDb.collection('adminSettings').doc('cipher').set(updatePayload, { merge: true });

    await createAuditLog({
      performedBy: admin.id,
      action: 'UPDATE_DAILY_CIPHER',
      targetId: 'cipher',
      targetType: 'adminSettings',
      details: { word: cleanWord, rewardAmount, date: today },
    });

    invalidateCache('admin_cipher');

    return Response.json({
      success: true,
      data: updatePayload,
    });
  } catch (error) {
    console.error('Admin cipher update error:', error);
    return serverError('Failed to update cipher settings');
  }
}
