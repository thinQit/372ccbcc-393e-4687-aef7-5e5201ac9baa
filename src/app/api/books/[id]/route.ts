import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { parseJson, stringifyJson } from '@/lib/serialization';
import { requireAdmin } from '@/lib/server-auth';

const idSchema = z.object({ id: z.string().min(1) });
const updateSchema = z.object({
  title: z.string().optional(),
  authors: z.array(z.string()).optional(),
  isbn: z.string().optional(),
  description: z.string().optional(),
  genres: z.array(z.string()).optional(),
  price_cents: z.number().min(0).optional(),
  currency: z.string().optional(),
  stock: z.number().min(0).optional(),
  images: z.array(z.string()).optional(),
  publisher: z.string().optional(),
  published_date: z.string().optional(),
  language: z.string().optional(),
  weight_grams: z.number().optional(),
  dimensions_cm: z.string().optional(),
  rating_avg: z.number().optional(),
  review_count: z.number().optional(),
  seo_meta: z.record(z.unknown()).optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    idSchema.parse(params);
    const book = await db.book.findUnique({ where: { id: params.id } });
    if (!book) {
      return NextResponse.json({ success: false, error: 'Book not found' }, { status: 404 });
    }
    const [recommendations, reviews] = await Promise.all([
      db.book.findMany({ take: 4 }),
      db.review.findMany({ where: { book_id: params.id, is_moderated: true }, take: 5 })
    ]);

    const mappedBook = {
      id: book.id,
      title: book.title,
      authors: parseJson<string[]>(book.authors, []),
      isbn: book.isbn,
      description: book.description,
      genres: parseJson<string[]>(book.genres, []),
      price_cents: book.price_cents,
      currency: book.currency,
      stock: book.stock,
      images: parseJson<string[]>(book.images, []),
      publisher: book.publisher,
      published_date: book.published_date ? book.published_date.toISOString() : undefined,
      language: book.language,
      weight_grams: book.weight_grams,
      dimensions_cm: book.dimensions_cm,
      rating_avg: book.rating_avg,
      review_count: book.review_count,
      seo_meta: parseJson<Record<string, unknown>>(book.seo_meta, {})
    };

    return NextResponse.json({ success: true, data: { book: mappedBook, recommendations, reviews } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch book' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    idSchema.parse(params);
    const payload = updateSchema.parse(await request.json());

    const book = await db.book.update({
      where: { id: params.id },
      data: {
        title: payload.title,
        authors: payload.authors ? stringifyJson(payload.authors) : undefined,
        isbn: payload.isbn,
        description: payload.description,
        genres: payload.genres ? stringifyJson(payload.genres) : undefined,
        price_cents: payload.price_cents,
        currency: payload.currency,
        stock: payload.stock,
        images: payload.images ? stringifyJson(payload.images) : undefined,
        publisher: payload.publisher,
        published_date: payload.published_date ? new Date(payload.published_date) : undefined,
        language: payload.language,
        weight_grams: payload.weight_grams,
        dimensions_cm: payload.dimensions_cm,
        rating_avg: payload.rating_avg,
        review_count: payload.review_count,
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
    idSchema.parse(params);
    await db.book.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to delete book' }, { status: 400 });
  }
}
