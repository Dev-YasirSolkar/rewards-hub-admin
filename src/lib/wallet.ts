import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export type TransactionType =
  | 'task_reward'
  | 'daily_bonus'
  | 'daily_reward'
  | 'checkin_bonus_2x'
  | 'tap_reward'
  | 'spin_reward'
  | 'referral_bonus'
  | 'ad_reward'
  | 'affiliate_reward'
  | 'withdrawal'
  | 'withdrawal_reversal'
  | 'admin_adjustment';

export interface CreateTransactionInput {
  userId: string;
  type: TransactionType;
  amount: number; // positive for credit, negative for debit
  source: string;
  referenceId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export async function createTransaction(input: CreateTransactionInput): Promise<{ transactionId: string; newBalance: number }> {
  const { userId, type, amount, source, referenceId, description } = input;

  if (!Number.isFinite(amount) || amount === 0) {
    throw new Error('Invalid transaction amount');
  }

  let userRef = adminDb.collection('users').doc(userId);
  const userCheck = await userRef.get();
  if (!userCheck.exists) {
    const numId = Number(userId);
    let q = !isNaN(numId) ? await adminDb.collection('users').where('telegramId', '==', numId).limit(1).get() : null;
    if (!q || q.empty) {
      q = await adminDb.collection('users').where('telegramId', '==', String(userId)).limit(1).get();
    }
    if (q && !q.empty) {
      userRef = q.docs[0].ref;
    }
  }

  const txRef = adminDb.collection('transactions').doc();

  const result = await adminDb.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists) throw new Error('User not found');

    const userData = userDoc.data()!;
    const balanceBefore = Number(userData.pointsBalance || 0);
    const balanceAfter = balanceBefore + amount;

    if (balanceAfter < 0) throw new Error('Insufficient balance');

    const updateData: Record<string, unknown> = {
      pointsBalance: balanceAfter,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (amount > 0 && type !== 'withdrawal_reversal') {
      updateData.lifetimeEarned = Number(userData.lifetimeEarned || 0) + amount;
    }
    if (type === 'withdrawal' && amount < 0) {
      updateData.lifetimeWithdrawn = Number(userData.lifetimeWithdrawn || 0) + Math.abs(amount);
    }
    if (type === 'withdrawal_reversal') {
      updateData.lifetimeWithdrawn = Math.max(0, Number(userData.lifetimeWithdrawn || 0) - amount);
    }

    transaction.update(userRef, updateData);

    transaction.set(txRef, {
      userId: userRef.id,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      source,
      referenceId: referenceId || null,
      description,
      status: 'completed',
      createdAt: FieldValue.serverTimestamp(),
    });

    return { transactionId: txRef.id, newBalance: balanceAfter };
  });

  return result;
}
