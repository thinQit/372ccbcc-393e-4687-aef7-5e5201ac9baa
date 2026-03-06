import { PrismaClient } from '@prisma/client';

type PrismaGlobal = typeof globalThis & { prisma?: PrismaClient };

const globalForPrisma = globalThis as PrismaGlobal;

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

export default db;
