import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';

const updateSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  helpful_count: z.number().min(0).optional(),
  is_moderated: z.boolean().optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const review = await db.review.findUnique({ where: { id: params.id } });
    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { review } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch review' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const payload = updateSchema.parse(await request.json());
    const review = await db.review.update({ where: { id: params.id }, data: payload });
    return NextResponse.json({ success: true, data: { review } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to update review' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await db.review.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to delete review' }, { status: 400 });
  }
}
