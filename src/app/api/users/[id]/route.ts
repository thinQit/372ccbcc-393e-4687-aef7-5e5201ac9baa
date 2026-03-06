import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';
import { parseJson, stringifyJson } from '@/lib/serialization';

const updateSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  shipping_addresses: z.array(z.record(z.unknown())).optional(),
  billing_addresses: z.array(z.record(z.unknown())).optional(),
  preferences: z.record(z.unknown()).optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const user = await db.user.findUnique({ where: { id: params.id } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    const mapped = {
      ...user,
      shipping_addresses: parseJson<Record<string, unknown>[]>(user.shipping_addresses, []),
      billing_addresses: parseJson<Record<string, unknown>[]>(user.billing_addresses, []),
      preferences: parseJson<Record<string, unknown>>(user.preferences, {})
    };
    return NextResponse.json({ success: true, data: { user: mapped } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch user' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const payload = updateSchema.parse(await request.json());
    const user = await db.user.update({
      where: { id: params.id },
      data: {
        full_name: payload.full_name,
        email: payload.email,
        role: payload.role,
        shipping_addresses: payload.shipping_addresses ? stringifyJson(payload.shipping_addresses) : undefined,
        billing_addresses: payload.billing_addresses ? stringifyJson(payload.billing_addresses) : undefined,
        preferences: payload.preferences ? stringifyJson(payload.preferences) : undefined
      }
    });
    return NextResponse.json({ success: true, data: { user } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to update user' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await db.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to delete user' }, { status: 400 });
  }
}
