import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export type TransactionType =
  | 'task_reward'
  | 'daily_bonus'
  | 'daily_reward'
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

  const userRef = adminDb.collection('users').doc(userId);
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

    transaction.update(userRef, updateData);

    transaction.set(txRef, {
      userId,
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
