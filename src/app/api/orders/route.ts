import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/server-auth';
import { parseJson } from '@/lib/serialization';

const querySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  status: z.string().optional(),
  user_id: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const parsed = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const page = parsed.page ?? 1;
    const limit = parsed.limit ?? 20;

    const where = {
      ...(parsed.status ? { status: parsed.status } : {}),
      ...(user.role === 'admin' && parsed.user_id ? { user_id: parsed.user_id } : { user_id: user.id })
    };

    const [orders, total] = await Promise.all([
      db.order.findMany({ where, orderBy: { created_at: 'desc' }, skip: (page - 1) * limit, take: limit }),
      db.order.count({ where })
    ]);

    const mapped = orders.map((order) => ({
      ...order,
      items: parseJson<Record<string, unknown>[]>(order.items, []),
      shipping_address: parseJson<Record<string, unknown>>(order.shipping_address, {}),
      billing_address: parseJson<Record<string, unknown>>(order.billing_address, {})
    }));

    return NextResponse.json({ success: true, data: { orders: mapped, total, page, limit } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch orders' }, { status: 400 });
  }
}
