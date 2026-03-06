import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, requireUser } from '@/lib/server-auth';

const querySchema = z.object({
  book_id: z.string().optional(),
  user_id: z.string().optional()
});

const createSchema = z.object({
  book_id: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(3)
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const parsed = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const reviews = await db.review.findMany({
      where: {
        ...(parsed.book_id ? { book_id: parsed.book_id } : {}),
        ...(parsed.user_id ? { user_id: parsed.user_id } : {})
      },
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json({ success: true, data: { reviews } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch reviews' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const payload = createSchema.parse(await request.json());
    const review = await db.review.create({
      data: {
        user_id: user.id,
        book_id: payload.book_id,
        rating: payload.rating,
        title: payload.title,
        body: payload.body,
        is_moderated: false
      }
    });
    return NextResponse.json({ success: true, data: { review } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to create review' }, { status: 400 });
  }
}
