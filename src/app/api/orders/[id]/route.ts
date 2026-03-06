import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/server-auth';
import { parseJson } from '@/lib/serialization';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    const where = user.role === 'admin' ? { id: params.id } : { id: params.id, user_id: user.id };
    const order = await db.order.findFirst({ where });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const mapped = {
      ...order,
      items: parseJson<Record<string, unknown>[]>(order.items, []),
      shipping_address: parseJson<Record<string, unknown>>(order.shipping_address, {}),
      billing_address: parseJson<Record<string, unknown>>(order.billing_address, {})
    };

    return NextResponse.json({ success: true, data: { order: mapped } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch order' }, { status: 400 });
  }
}
