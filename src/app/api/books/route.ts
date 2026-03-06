import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { parseJson, stringifyJson } from '@/lib/serialization';
import { requireAdmin } from '@/lib/server-auth';

const querySchema = z.object({
  q: z.string().optional(),
  author: z.string().optional(),
  genre: z.string().optional(),
  sort: z.enum(['bestsellers', 'newest', 'price']).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional()
});

const createSchema = z.object({
  title: z.string().min(1),
  authors: z.array(z.string()).optional(),
  isbn: z.string().optional(),
  description: z.string().optional(),
  genres: z.array(z.string()).optional(),
  price_cents: z.number().min(0),
  currency: z.string().optional(),
  stock: z.number().min(0),
  images: z.array(z.string()).optional(),
  publisher: z.string().optional(),
  published_date: z.string().optional(),
  language: z.string().optional(),
  weight_grams: z.number().optional(),
  dimensions_cm: z.string().optional(),
  seo_meta: z.record(z.unknown()).optional()
});

export async function GET(request: NextRequest) {
  try {
    const parsed = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const page = parsed.page ?? 1;
    const limit = parsed.limit ?? 12;

    const where = {
      ...(parsed.q ? { title: { contains: parsed.q, mode: 'insensitive' } } : {}),
      ...(parsed.author ? { authors: { contains: parsed.author } } : {}),
      ...(parsed.genre ? { genres: { contains: parsed.genre } } : {})
    };

    const orderBy =
      parsed.sort === 'bestsellers'
        ? { review_count: 'desc' as const }
        : parsed.sort === 'newest'
          ? { published_date: 'desc' as const }
          : parsed.sort === 'price'
            ? { price_cents: 'asc' as const }
            : { title: 'asc' as const };

    const [results, total] = await Promise.all([
      db.book.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      db.book.count({ where })
    ]);

    const mapped = results.map((book) => ({
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
    }));

    return NextResponse.json({ success: true, data: { results: mapped, total, page, limit } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch books' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const payload = createSchema.parse(await request.json());
    const book = await db.book.create({
      data: {
        title: payload.title,
        authors: payload.authors ? stringifyJson(payload.authors) : null,
        isbn: payload.isbn,
        description: payload.description,
        genres: payload.genres ? stringifyJson(payload.genres) : null,
        price_cents: payload.price_cents,
        currency: payload.currency ?? 'USD',
        stock: payload.stock,
        images: payload.images ? stringifyJson(payload.images) : null,
        publisher: payload.publisher,
        published_date: payload.published_date ? new Date(payload.published_date) : null,
        language: payload.language,
        weight_grams: payload.weight_grams,
        dimensions_cm: payload.dimensions_cm,
        seo_meta: payload.seo_meta ? stringifyJson(payload.seo_meta) : null
      }
    });

    return NextResponse.json({ success: true, data: { book } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to create book' }, { status: 400 });
  }
}
