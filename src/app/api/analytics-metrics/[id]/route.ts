import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';

const updateSchema = z.object({
  date: z.string().optional(),
  metric: z.string().optional(),
  value: z.number().optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const metric = await db.analyticsMetric.findUnique({ where: { id: params.id } });
    if (!metric) {
      return NextResponse.json({ success: false, error: 'Metric not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { metric } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch metric' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const payload = updateSchema.parse(await request.json());
    const metric = await db.analyticsMetric.update({
      where: { id: params.id },
      data: {
        date: payload.date ? new Date(payload.date) : undefined,
        metric: payload.metric,
        value: payload.value
      }
    });
    return NextResponse.json({ success: true, data: { metric } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to update metric' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await db.analyticsMetric.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to delete metric' }, { status: 400 });
  }
}
