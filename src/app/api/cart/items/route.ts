import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/server-auth';
import { parseJson, stringifyJson } from '@/lib/serialization';

const schema = z.object({
  book_id: z.string().min(1),
  quantity: z.number().min(1)
});

type CartItem = {
  id: string;
  book_id: string;
  title?: string | null;
  quantity: number;
  price_cents: number;
};

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const payload = schema.parse(await request.json());

    const book = await db.book.findUnique({ where: { id: payload.book_id } });
    if (!book) {
      return NextResponse.json({ success: false, error: 'Book not found' }, { status: 404 });
    }

    let cart = await db.cart.findFirst({ where: { user_id: user.id } });
    if (!cart) {
      cart = await db.cart.create({
        data: { user_id: user.id, items: stringifyJson([]), total_cents: 0, currency: 'USD' }
      });
    }

    const items = parseJson<CartItem[]>(cart.items, []);
    const existing = items.find((item) => item.book_id === payload.book_id);

    if (existing) {
      existing.quantity = payload.quantity;
    } else {
      items.push({
        id: randomUUID(),
        book_id: payload.book_id,
        title: book.title,
        quantity: payload.quantity,
        price_cents: book.price_cents ?? 0
      });
    }

    const total_cents = items.reduce((sum, item) => sum + item.price_cents * item.quantity, 0);

    const updated = await db.cart.update({
      where: { id: cart.id },
      data: { items: stringifyJson(items), total_cents }
    });

    return NextResponse.json({
      success: true,
      data: { cart: { ...updated, items } }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to update cart' }, { status: 400 });
  }
}
