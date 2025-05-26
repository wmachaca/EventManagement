// tests/unit/auth/login.test.ts
import request from 'supertest';
import app from '../../../src/server';
import { cleanDatabase, createTestUser } from '../../setup';
import userFixtures from '../../fixtures/users';

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await cleanDatabase();
    await createTestUser(); // sets up valid user from fixtures
  });

  it('should login with valid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send(userFixtures.validLogin);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        token: expect.any(String),
        user: expect.objectContaining({
          email: userFixtures.validLogin.email,
        }),
      },
    });
  });

  it('should fail with invalid password', async () => {
    const response = await request(app).post('/api/auth/login').send(userFixtures.invalidLogin); // same email, wrong password

    expect(response.status).toBe(401);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/invalid credentials/i),
      }),
    );
  });

  it('should require both email and password', async () => {
    const response = await request(app).post('/api/auth/login').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'password' }),
      ]),
    );
  });

  it('should fail if user does not exist', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: 'any-password' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/invalid credentials/i);
  });

  it('should fail if password is missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: userFixtures.validLogin.email });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'password' })]),
    );
  });

  it('should fail if email is missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ password: userFixtures.validLogin.password });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
    );
  });
});
