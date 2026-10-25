import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSessionToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!rateLimit(ip, 'admin-login', 5, 60)) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please wait 1 minute.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { secret } = body;

    const expectedSecret = process.env.ADMIN_SECRET || 'admin12345';

    if (!secret || typeof secret !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid admin secret key' }, { status: 401 });
    }

    const secretHash = crypto.createHash('sha256').update(secret).digest();
    const expectedHash = crypto.createHash('sha256').update(expectedSecret).digest();

    if (!crypto.timingSafeEqual(secretHash, expectedHash)) {
      return NextResponse.json({ success: false, error: 'Invalid admin secret key' }, { status: 401 });
    }

    const token = createSessionToken();
    const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });

    response.cookies.set({
      name: 'admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
