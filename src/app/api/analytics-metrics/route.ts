import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';

const createSchema = z.object({
  date: z.string().optional(),
  metric: z.string().min(1),
  value: z.number()
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const metrics = await db.analyticsMetric.findMany({ orderBy: { date: 'desc' } });
    return NextResponse.json({ success: true, data: { metrics } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch metrics' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const payload = createSchema.parse(await request.json());
    const metric = await db.analyticsMetric.create({
      data: {
        date: payload.date ? new Date(payload.date) : new Date(),
        metric: payload.metric,
        value: payload.value
      }
    });
    return NextResponse.json({ success: true, data: { metric } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to create metric' }, { status: 400 });
  }
}
