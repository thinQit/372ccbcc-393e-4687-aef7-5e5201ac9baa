import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/server-auth';
import { parseJson, stringifyJson } from '@/lib/serialization';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    let cart = await db.cart.findFirst({ where: { user_id: user.id } });

    if (!cart) {
      cart = await db.cart.create({
        data: { user_id: user.id, items: stringifyJson([]), total_cents: 0, currency: 'USD' }
      });
    }

    const items = parseJson<Record<string, unknown>[]>(cart.items, []);

    return NextResponse.json({
      success: true,
      data: { cart: { ...cart, items } }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
