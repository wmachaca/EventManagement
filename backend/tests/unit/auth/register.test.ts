// tests/unit/auth/register.test.ts
import request from 'supertest';
import app from '../../../src/server';
import { cleanDatabase, prisma, userFixtures } from '../../setup';

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should register a new user with valid data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(userFixtures.validRegistration);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      data: {
        user: {
          id: expect.any(Number),
          name: userFixtures.validRegistration.name,
          email: userFixtures.validRegistration.email,
          provider: 'credentials',
          createdAt: expect.any(String),
        },
        token: expect.any(String),
      },
    });

    // Verify user was actually created
    const dbUser = await prisma.user.findUnique({
      where: { email: userFixtures.validRegistration.email },
      include: { auth: true },
    });

    expect(dbUser).toBeTruthy();
    expect(dbUser?.auth).toBeTruthy();
  });

  it('should reject invalid registration data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(userFixtures.invalidRegistration);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'password' }),
      ])
    );
  });

  it('should prevent duplicate email registration', async () => {
    // First create the existing user
    await prisma.user.create({
      data: {
        name: userFixtures.existingUser.name,
        email: userFixtures.existingUser.email,
        provider: userFixtures.existingUser.provider,
        auth: {
          create: {
            password: userFixtures.existingUser.auth.password,
            salt: userFixtures.existingUser.auth.salt,
          },
        },
      },
    });

    // Try to register with same email
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        ...userFixtures.validRegistration,
        email: userFixtures.existingUser.email,
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      success: false,
      message: expect.stringContaining('already registered'),
    });
  });
});