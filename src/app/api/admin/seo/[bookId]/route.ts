import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';
import { stringifyJson } from '@/lib/serialization';

const schema = z.object({
  seo_meta: z.record(z.unknown())
});

export async function PUT(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    await requireAdmin(request);
    const payload = schema.parse(await request.json());
    const book = await db.book.update({
      where: { id: params.bookId },
      data: { seo_meta: stringifyJson(payload.seo_meta) }
    });

    return NextResponse.json({ success: true, data: { book } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to update SEO metadata' }, { status: 400 });
  }
}
