import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function createAuditLog(data: {
  action: string;
  performedBy: string;
  targetId?: string;
  targetType?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  await adminDb.collection('auditLogs').add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  });
}
