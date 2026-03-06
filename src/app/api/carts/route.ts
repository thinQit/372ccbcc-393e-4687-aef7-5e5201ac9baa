import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';
import { parseJson, stringifyJson } from '@/lib/serialization';

const createSchema = z.object({
  user_id: z.string().optional(),
  items: z.array(z.record(z.unknown())).optional(),
  total_cents: z.number().min(0).optional(),
  currency: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const carts = await db.cart.findMany({ orderBy: { updated_at: 'desc' } });
    const mapped = carts.map((cart) => ({
      ...cart,
      items: parseJson<Record<string, unknown>[]>(cart.items, [])
    }));
    return NextResponse.json({ success: true, data: { carts: mapped } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch carts' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const payload = createSchema.parse(await request.json());
    const cart = await db.cart.create({
      data: {
        user_id: payload.user_id,
        items: payload.items ? stringifyJson(payload.items) : stringifyJson([]),
        total_cents: payload.total_cents ?? 0,
        currency: payload.currency ?? 'USD'
      }
    });
    return NextResponse.json({ success: true, data: { cart } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to create cart' }, { status: 400 });
  }
}
