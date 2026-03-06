import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    return NextResponse.json({ success: true, data: { received: true } });
  } catch {
    return NextResponse.json({ success: false, error: 'Webhook failed' }, { status: 400 });
  }
}
