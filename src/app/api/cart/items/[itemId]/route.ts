import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/server-auth';
import { parseJson, stringifyJson } from '@/lib/serialization';

type CartItem = {
  id: string;
  book_id: string;
  title?: string | null;
  quantity: number;
  price_cents: number;
};

export async function DELETE(request: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const user = await requireUser(request);
    const cart = await db.cart.findFirst({ where: { user_id: user.id } });

    if (!cart) {
      return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
    }

    const items = parseJson<CartItem[]>(cart.items, []);
    const filtered = items.filter((item) => item.id !== params.itemId);
    const total_cents = filtered.reduce((sum, item) => sum + item.price_cents * item.quantity, 0);

    const updated = await db.cart.update({
      where: { id: cart.id },
      data: { items: stringifyJson(filtered), total_cents }
    });

    return NextResponse.json({ success: true, data: { cart: { ...updated, items: filtered } } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to remove item' }, { status: 400 });
  }
}
