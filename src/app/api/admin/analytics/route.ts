import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const metrics = await db.analyticsMetric.findMany({ orderBy: { date: 'desc' }, take: 50 });
    return NextResponse.json({ success: true, data: { metrics, charts: {} } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
