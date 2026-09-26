import { NextRequest } from 'next/server';
import crypto from 'crypto';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin12345';
const SESSION_COOKIE_NAME = 'admin_session';

export function createSessionToken(): string {
  const timestamp = Date.now();
  const data = `admin:${timestamp}`;
  const hmac = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('hex');
  return Buffer.from(`${data}:${hmac}`).toString('base64');
}

export function verifySessionToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;

    const [role, timestampStr, hmac] = parts;
    if (role !== 'admin') return false;

    const timestamp = parseInt(timestampStr, 10);
    // Session valid for 7 days
    if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) return false;

    const expectedHmac = crypto.createHmac('sha256', ADMIN_SECRET).update(`admin:${timestampStr}`).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}

export function verifyAdminAuth(request: NextRequest | Request): boolean {
  // 1. Check direct header
  const authHeader = request.headers.get('x-admin-secret');
  if (authHeader && authHeader === ADMIN_SECRET) {
    return true;
  }

  // 2. Check Cookie
  let cookieHeader: string | null = null;
  if ('cookies' in request && typeof (request as any).cookies?.get === 'function') {
    const sessionCookie = (request as any).cookies.get(SESSION_COOKIE_NAME);
    if (sessionCookie?.value && verifySessionToken(sessionCookie.value)) {
      return true;
    }
  }

  cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith(`${SESSION_COOKIE_NAME}=`));
    if (match) {
      const token = match.split('=')[1];
      if (token && verifySessionToken(decodeURIComponent(token))) {
        return true;
      }
    }
  }

  return false;
}

export interface AdminUser {
  id: string;
  role: 'admin';
  telegramId?: number;
  username?: string;
  firstName?: string;
}

export async function authenticateAdmin(request: NextRequest | Request): Promise<AdminUser | null> {
  if (verifyAdminAuth(request)) {
    return {
      id: 'admin',
      role: 'admin',
      telegramId: 0,
      username: 'admin',
      firstName: 'Admin',
    };
  }
  return null;
}

export function unauthorizedResponse() {
  return Response.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin authentication required' } }, { status: 401 });
}

export function forbiddenResponse() {
  return Response.json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 });
}

export function badRequest(message: string) {
  return Response.json({ success: false, error: { code: 'BAD_REQUEST', message } }, { status: 400 });
}

export function serverError(message: any = 'Internal server error') {
  const msg = typeof message === 'string' ? message : (message?.message || 'Internal server error');
  return Response.json({ success: false, error: { code: 'SERVER_ERROR', message: msg } }, { status: 500 });
}
