import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';
import { stringifyJson } from '@/lib/serialization';

const schema = z.object({
  title: z.string().min(1),
  authors: z.array(z.string()).optional(),
  isbn: z.string().optional(),
  description: z.string().optional(),
  price_cents: z.number().min(0),
  stock: z.number().min(0),
  images: z.array(z.string()).optional(),
  seo_meta: z.record(z.unknown()).optional()
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const payload = schema.parse(await request.json());

    const book = await db.book.create({
      data: {
        title: payload.title,
        authors: payload.authors ? stringifyJson(payload.authors) : null,
        isbn: payload.isbn,
        description: payload.description,
        price_cents: payload.price_cents,
        stock: payload.stock,
        images: payload.images ? stringifyJson(payload.images) : null,
        seo_meta: payload.seo_meta ? stringifyJson(payload.seo_meta) : null
      }
    });

    return NextResponse.json({ success: true, data: { book } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to create book' }, { status: 400 });
  }
}
