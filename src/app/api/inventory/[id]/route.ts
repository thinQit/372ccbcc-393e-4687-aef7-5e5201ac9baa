import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';

const updateSchema = z.object({
  sku: z.string().optional(),
  stock_level: z.number().min(0).optional(),
  reorder_threshold: z.number().min(0).optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const record = await db.inventory.findUnique({ where: { book_id: params.id } });
    if (!record) {
      return NextResponse.json({ success: false, error: 'Inventory record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { inventory: record } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch inventory record' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const payload = updateSchema.parse(await request.json());
    const record = await db.inventory.update({ where: { book_id: params.id }, data: payload });
    return NextResponse.json({ success: true, data: { inventory: record } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to update inventory record' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await db.inventory.delete({ where: { book_id: params.id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to delete inventory record' }, { status: 400 });
  }
}
