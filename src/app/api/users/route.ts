import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';
import { hashPassword } from '@/lib/auth';
import { parseJson, stringifyJson } from '@/lib/serialization';

const createSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().optional(),
  shipping_addresses: z.array(z.record(z.unknown())).optional(),
  billing_addresses: z.array(z.record(z.unknown())).optional(),
  preferences: z.record(z.unknown()).optional()
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const users = await db.user.findMany({ orderBy: { created_at: 'desc' } });
    const mapped = users.map((user) => ({
      ...user,
      shipping_addresses: parseJson<Record<string, unknown>[]>(user.shipping_addresses, []),
      billing_addresses: parseJson<Record<string, unknown>[]>(user.billing_addresses, []),
      preferences: parseJson<Record<string, unknown>>(user.preferences, {})
    }));
    return NextResponse.json({ success: true, data: { users: mapped } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch users' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const payload = createSchema.parse(await request.json());
    const user = await db.user.create({
      data: {
        full_name: payload.full_name,
        email: payload.email,
        password_hash: await hashPassword(payload.password),
        role: payload.role ?? 'customer',
        shipping_addresses: payload.shipping_addresses ? stringifyJson(payload.shipping_addresses) : null,
        billing_addresses: payload.billing_addresses ? stringifyJson(payload.billing_addresses) : null,
        preferences: payload.preferences ? stringifyJson(payload.preferences) : null
      }
    });
    return NextResponse.json({ success: true, data: { user } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to create user' }, { status: 400 });
  }
}
