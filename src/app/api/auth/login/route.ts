import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(request: NextRequest) {
  try {
    const payload = schema.parse(await request.json());
    const user = await db.user.findUnique({ where: { email: payload.email } });
    if (!user || !user.password_hash) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(payload.password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    await db.user.update({ where: { id: user.id }, data: { last_login: new Date() } });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({
      success: true,
      data: { token, user: { id: user.id, email: user.email, full_name: user.full_name } }
    });
    response.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', path: '/' });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid login payload' }, { status: 400 });
  }
}
