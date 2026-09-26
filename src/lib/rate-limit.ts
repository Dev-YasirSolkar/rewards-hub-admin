const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean;
export function rateLimit(ip: string, action: string, limit: number, windowSec: number): boolean;
export function rateLimit(
  arg1: string,
  arg2: string | number,
  arg3: number,
  arg4?: number
): boolean {
  let key: string;
  let limit: number;
  let windowMs: number;

  if (typeof arg2 === 'string') {
    key = `${arg1}:${arg2}`;
    limit = arg3;
    windowMs = (arg4 || 60) * 1000;
  } else {
    key = arg1;
    limit = arg2;
    windowMs = arg3;
  }

  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }, 60_000);
}
