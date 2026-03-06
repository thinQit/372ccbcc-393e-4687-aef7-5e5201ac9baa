import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/server-auth';
import { parseJson, stringifyJson } from '@/lib/serialization';

const schema = z.object({
  cart_id: z.string().min(1),
  shipping_address: z.record(z.unknown()),
  billing_address: z.record(z.unknown()),
  payment_method: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const payload = schema.parse(await request.json());

    const cart = await db.cart.findUnique({ where: { id: payload.cart_id } });
    if (!cart) {
      return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
    }

    const items = parseJson<Record<string, unknown>[]>(cart.items, []);

    await db.order.create({
      data: {
        user_id: user.id,
        items: stringifyJson(items),
        total_cents: cart.total_cents,
        currency: cart.currency,
        shipping_address: stringifyJson(payload.shipping_address),
        billing_address: stringifyJson(payload.billing_address),
        status: 'processing',
        payment_status: 'pending',
        stripe_payment_id: randomUUID()
      }
    });

    return NextResponse.json({
      success: true,
      data: { checkout_session_id: randomUUID(), checkout_url: 'https://checkout.stripe.com/pay/test' }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Checkout failed' }, { status: 400 });
  }
}
