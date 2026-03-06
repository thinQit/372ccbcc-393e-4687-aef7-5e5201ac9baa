import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/server-auth';

const updateSchema = z.object({
  name: z.string().optional(),
  html: z.string().optional(),
  css: z.string().optional(),
  preview_image: z.string().optional(),
  rating_avg: z.number().optional(),
  is_active: z.boolean().optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const template = await db.template.findUnique({ where: { id: params.id } });
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { template } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch template' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const payload = updateSchema.parse(await request.json());
    const template = await db.template.update({ where: { id: params.id }, data: payload });
    return NextResponse.json({ success: true, data: { template } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to update template' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await db.template.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to delete template' }, { status: 400 });
  }
}
