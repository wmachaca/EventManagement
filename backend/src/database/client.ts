// src/database/client.ts
import { PrismaClient } from '@prisma/client';

// Instantiate Prisma Client
const prisma = new PrismaClient();

// Export the Prisma client instance
export { prisma };