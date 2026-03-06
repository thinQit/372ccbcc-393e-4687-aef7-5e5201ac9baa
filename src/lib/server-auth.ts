import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export async function getCurrentUser(request: NextRequest) {
  const headerToken = getTokenFromHeader(request.headers.get('authorization'));
  const cookieToken = request.cookies.get('token')?.value;
  const token = headerToken || cookieToken;
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    const userId = typeof payload.userId === 'string' ? payload.userId : null;
    if (!userId) return null;
    return await db.user.findUnique({ where: { id: userId } });
  } catch {
    return null;
  }
}

export async function requireUser(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function requireAdmin(request: NextRequest) {
  const user = await requireUser(request);
  if (user.role !== 'admin') throw new Error('Forbidden');
  return user;
}
