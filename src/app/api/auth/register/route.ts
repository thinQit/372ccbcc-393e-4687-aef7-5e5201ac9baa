import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { stringifyJson } from '@/lib/serialization';

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  newsletter_optin: z.boolean().optional()
});

export async function POST(request: NextRequest) {
  try {
    const payload = schema.parse(await request.json());
    const existing = await db.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        full_name: payload.full_name,
        email: payload.email,
        password_hash: await hashPassword(payload.password),
        role: 'customer',
        preferences: stringifyJson({ newsletter_optin: payload.newsletter_optin ?? false })
      }
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({
      success: true,
      data: { user: { id: user.id, email: user.email, full_name: user.full_name }, token }
    });
    response.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', path: '/' });
    return response;
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: 'Invalid registration payload' }, { status: 400 });
  }
}
