// tests/setup.ts

import { execSync } from 'child_process';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import userFixtures from './fixtures/users';
import eventFixtures from './fixtures/events';
import applicationFixtures from './fixtures/applications';
import request from 'supertest';
import app from '../src/server'; // Ensure your Express app is exported here
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient();

// Clean and reset the database before all tests
beforeAll(async () => {
  // Faster than migrate reset
  await prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE`;
  await prisma.$executeRaw`CREATE SCHEMA public`;
  await prisma.$executeRaw`GRANT ALL ON SCHEMA public TO testuserem`;

  // Apply migrations
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  // Seed test users
  for (const user of userFixtures.validUsers) {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        provider: user.provider,
        auth: {
          create: {
            password: user.auth.password,
            salt: user.auth.salt,
          },
        },
      },
    });
  }

  // Seed events
  for (const event of eventFixtures.validEvents) {
    await prisma.event.create({ data: event });
  }

  // Seed applications (if needed)
  for (const app of applicationFixtures.validApplications) {
    await prisma.eventApplication.create({ data: app });
  }
});

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Utility function to clean DB during tests
export const cleanDatabase = async () => {
  await prisma.eventApplication.deleteMany();
  await prisma.event.deleteMany();
  await prisma.userAuth.deleteMany();
  await prisma.user.deleteMany();
};

// Utility to create a valid test user manually
export const createTestUser = async (userData = userFixtures.validUsers[0]) => {
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
  });
};

// Utility to get auth token (if JWT-based auth)
export const getAuthToken = async () => {
  const res = await request(app).post('/api/auth/login').send({
    email: 'test@example.com',
    password: 'testpassword', // match your seed user
  });

  return res.body.token;
};
