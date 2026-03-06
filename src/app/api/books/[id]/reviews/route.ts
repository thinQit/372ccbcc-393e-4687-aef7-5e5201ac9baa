import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/server-auth';

const schema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(3)
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    const payload = schema.parse(await request.json());

    const review = await db.review.create({
      data: {
        user_id: user.id,
        book_id: params.id,
        rating: payload.rating,
        title: payload.title,
        body: payload.body,
        is_moderated: false
      }
    });

    return NextResponse.json({ success: true, data: { review } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to submit review' }, { status: 400 });
  }
}
