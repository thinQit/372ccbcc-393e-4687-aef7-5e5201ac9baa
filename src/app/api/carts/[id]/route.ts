import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';
import { parseJson, stringifyJson } from '@/lib/serialization';

const updateSchema = z.object({
  items: z.array(z.record(z.unknown())).optional(),
  total_cents: z.number().min(0).optional(),
  currency: z.string().optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const cart = await db.cart.findUnique({ where: { id: params.id } });
    if (!cart) {
      return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
    }
    const mapped = { ...cart, items: parseJson<Record<string, unknown>[]>(cart.items, []) };
    return NextResponse.json({ success: true, data: { cart: mapped } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch cart' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const payload = updateSchema.parse(await request.json());
    const cart = await db.cart.update({
      where: { id: params.id },
      data: {
        items: payload.items ? stringifyJson(payload.items) : undefined,
        total_cents: payload.total_cents,
        currency: payload.currency
      }
    });
    return NextResponse.json({ success: true, data: { cart } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to update cart' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await db.cart.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to delete cart' }, { status: 400 });
  }
}
