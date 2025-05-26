// tests/setup.ts
import { merge } from 'lodash';
import { execSync } from 'child_process'; // Add this import at the top
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../src/server';
import dotenv from 'dotenv';
import userFixtures from './fixtures/users';

dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

// ✅ Increase timeout BEFORE `beforeAll`
jest.setTimeout(30000);

// Clean database completely (in correct order to avoid FK constraints)
const cleanDatabase = async () => {
  await prisma.$transaction([
    prisma.eventApplication.deleteMany(),
    prisma.event.deleteMany(),
    prisma.userAuth.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};

// Create a test user using fixtures
//allow overrides
const createTestUser = async (overrides = {}) => {
  const userData = merge({}, userFixtures.existingUser, overrides);
  return prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      provider: userData.provider,
      auth: {
        create: {
          password: userData.auth.password,
          salt: userData.auth.salt,
        },
      },
    },
    include: {
      auth: true,
    },
  });
};

// Get auth token for test user
const getAuthToken = async () => {
  const response = await request(app).post('/api/auth/login').send(userFixtures.validLogin);

  return response.body.data?.token;
};

// Reset database before all tests
beforeAll(async () => {
  console.log('Starting database reset...');
  execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
  console.log('Reset complete, deploying...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('Deploy complete, cleaning...');
  await cleanDatabase();
  console.log('Setup complete');
});

// Disconnect prisma after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma, cleanDatabase, createTestUser, getAuthToken, userFixtures };
