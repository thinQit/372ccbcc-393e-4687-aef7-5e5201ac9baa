import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const templates = await db.template.findMany();
    return NextResponse.json({ success: true, data: { templates } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
