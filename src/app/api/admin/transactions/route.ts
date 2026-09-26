import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateAdmin, forbiddenResponse, serverError } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) return forbiddenResponse();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin_tx:${ip}`, 60, 60_000)) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');

    let snapshot;
    const isFiltered = (userId || (type && type !== 'all'));

    try {
      let query: any = adminDb.collection('transactions');
      if (userId) {
        query = query.where('userId', '==', userId);
      } else if (type && type !== 'all') {
        query = query.where('type', '==', type);
      }
      snapshot = await query.orderBy('createdAt', 'desc').limit(limit).get();
    } catch (indexErr) {
      console.warn('Transactions index query fallback:', indexErr);
      let query: any = adminDb.collection('transactions');
      if (userId) {
        query = query.where('userId', '==', userId);
      } else if (type && type !== 'all') {
        query = query.where('type', '==', type);
      }
      snapshot = await query.limit(limit * 2).get();
    }

    const transactions = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      let isoDate: string;
      if (data.createdAt?.toDate) {
        isoDate = data.createdAt.toDate().toISOString();
      } else if (typeof data.createdAt === 'string') {
        isoDate = data.createdAt;
      } else if (data.createdAt?._seconds) {
        isoDate = new Date(data.createdAt._seconds * 1000).toISOString();
      } else {
        isoDate = new Date().toISOString();
      }

      return {
        id: doc.id,
        ...data,
        createdAt: isoDate,
      };
    });

    transactions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: transactions, transactions });
  } catch (error) {
    return serverError(error);
  }
}
