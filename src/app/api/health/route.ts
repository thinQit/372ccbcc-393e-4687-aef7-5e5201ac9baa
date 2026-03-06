import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    return NextResponse.json({ success: true, data: { status: 'ok', uptime_seconds: Math.floor(process.uptime()) } });
  } catch {
    return NextResponse.json({ success: false, error: 'Health check failed' }, { status: 500 });
  }
}
