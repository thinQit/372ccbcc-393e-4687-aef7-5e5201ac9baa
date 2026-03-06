export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

const protectedPaths = ['/admin', '/account/orders', '/cart', '/checkout'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiresAuth = protectedPaths.some((path) => pathname.startsWith(path));
  if (!requiresAuth) return NextResponse.next();

  const token = request.cookies.get('token')?.value || request.headers.get('authorization');
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/account/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
