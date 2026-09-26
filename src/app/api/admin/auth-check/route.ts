import { NextRequest } from 'next/server';
import { authenticateAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return Response.json({ success: false, isAdmin: false }, { status: 403 });
    }
    return Response.json({
      success: true,
      isAdmin: true,
      user: {
        id: admin.id,
        telegramId: admin.telegramId,
        username: admin.username,
        firstName: admin.firstName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin auth check error:', error);
    return Response.json({ success: false, isAdmin: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const adminKey = body?.adminKey?.toString().trim();

    if (adminKey) {
      const adminSecret = process.env.ADMIN_SECRET?.trim();
      if (adminSecret && adminKey === adminSecret) {
        return Response.json({
          success: true,
          isAdmin: true,
          adminKey,
        });
      }
    }

    const admin = await authenticateAdmin(request);
    if (!admin) {
      return Response.json({ success: false, isAdmin: false, error: 'Invalid admin credentials' }, { status: 403 });
    }

    return Response.json({
      success: true,
      isAdmin: true,
      user: {
        id: admin.id,
        telegramId: admin.telegramId,
        username: admin.username,
        firstName: admin.firstName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin auth check POST error:', error);
    return Response.json({ success: false, isAdmin: false }, { status: 500 });
  }
}
