import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';

const createSchema = z.object({
  name: z.string().min(1),
  html: z.string().optional(),
  css: z.string().optional(),
  preview_image: z.string().optional(),
  rating_avg: z.number().optional(),
  is_active: z.boolean().optional()
});

export async function GET(_request: NextRequest) {
  try {
    const templates = await db.template.findMany({ where: { is_active: true } });
    return NextResponse.json({ success: true, data: { templates } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch templates' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const payload = createSchema.parse(await request.json());
    const template = await db.template.create({ data: payload });
    return NextResponse.json({ success: true, data: { template } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to create template' }, { status: 400 });
  }
}
