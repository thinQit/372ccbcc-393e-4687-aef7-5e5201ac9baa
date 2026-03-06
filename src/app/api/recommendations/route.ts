import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { parseJson, stringifyJson } from '@/lib/serialization';
import { requireAdmin } from '@/lib/server-auth';

const querySchema = z.object({
  user_id: z.string().optional(),
  seed_book_id: z.string().optional(),
  algorithm: z.string().optional()
});

const createSchema = z.object({
  user_id: z.string().optional(),
  book_ids: z.array(z.string()).min(1),
  algorithm: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const parsed = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const recommendations = await db.recommendation.findMany({
      where: {
        ...(parsed.user_id ? { user_id: parsed.user_id } : {}),
        ...(parsed.algorithm ? { algorithm: parsed.algorithm } : {})
      },
      orderBy: { created_at: 'desc' }
    });

    const mapped = recommendations.map((rec) => ({
      ...rec,
      book_ids: parseJson<string[]>(rec.book_ids, [])
    }));

    return NextResponse.json({ success: true, data: { recommendations: mapped } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch recommendations' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const payload = createSchema.parse(await request.json());
    const recommendation = await db.recommendation.create({
      data: {
        user_id: payload.user_id,
        book_ids: stringifyJson(payload.book_ids),
        algorithm: payload.algorithm ?? 'curated'
      }
    });
    return NextResponse.json({ success: true, data: { recommendation } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to create recommendation' }, { status: 400 });
  }
}
