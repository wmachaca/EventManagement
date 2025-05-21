// tests/unit/auth/login.test.ts
import request from 'supertest';
import app from '../../../src/server';
import { cleanDatabase, createTestUser } from '../../setup';
import userFixtures from '../../fixtures/users';

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await cleanDatabase();
    await createTestUser();
  });

  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send(userFixtures.validLogin);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        token: expect.any(String),
        user: {
          email: userFixtures.validLogin.email,
        },
      },
    });
  });

  it('should fail with invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send(userFixtures.invalidLogin);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/invalid credentials/i);
  });

  it('should require email and password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'password' }),
      ])
    );
  });
});