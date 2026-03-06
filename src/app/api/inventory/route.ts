import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';

const createSchema = z.object({
  book_id: z.string().min(1),
  sku: z.string().optional(),
  stock_level: z.number().min(0),
  reorder_threshold: z.number().min(0).optional()
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const inventory = await db.inventory.findMany();
    return NextResponse.json({ success: true, data: { inventory } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch inventory' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const payload = createSchema.parse(await request.json());
    const record = await db.inventory.create({ data: payload });
    return NextResponse.json({ success: true, data: { inventory: record } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to create inventory record' }, { status: 400 });
  }
}
