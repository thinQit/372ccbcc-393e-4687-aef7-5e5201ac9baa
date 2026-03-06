import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';
import { stringifyJson } from '@/lib/serialization';

const schema = z.object({
  title: z.string().optional(),
  authors: z.array(z.string()).optional(),
  isbn: z.string().optional(),
  description: z.string().optional(),
  price_cents: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  images: z.array(z.string()).optional(),
  seo_meta: z.record(z.unknown()).optional()
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const payload = schema.parse(await request.json());

    const book = await db.book.update({
      where: { id: params.id },
      data: {
        title: payload.title,
        authors: payload.authors ? stringifyJson(payload.authors) : undefined,
        isbn: payload.isbn,
        description: payload.description,
        price_cents: payload.price_cents,
        stock: payload.stock,
        images: payload.images ? stringifyJson(payload.images) : undefined,
        seo_meta: payload.seo_meta ? stringifyJson(payload.seo_meta) : undefined
      }
    });

    return NextResponse.json({ success: true, data: { book } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to update book' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await db.book.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to delete book' }, { status: 400 });
  }
}
