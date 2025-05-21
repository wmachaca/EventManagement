import request from 'supertest';
import app from '../../../src/server';
import { prisma, cleanDatabase, getAuthToken, createTestUser } from '../../setup';
import { createTestEvent } from '../../utils/eventTestUtils';
import { User } from '@prisma/client';

describe('Event Retrieval API', () => {
  let authToken: string;
  let testUser: User;
  let testEvent: any;

  beforeAll(async () => {
    await cleanDatabase();
    testUser = await createTestUser();
    authToken = await getAuthToken();
    testEvent = await createTestEvent(testUser.id, { name: 'Test Event' });
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it('GET /api/events/:id → should return a single event by ID', async () => {
    const res = await request(app)
      .get(`/api/events/${testEvent.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: testEvent.id,
      name: testEvent.name,
      status: testEvent.status,
    });
  });

  it('GET /api/events/:id → should return 404 for non-existent event', async () => {
    const res = await request(app)
      .get('/api/events/99999')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Event not found');
  });

  it('GET /api/events/all → should list all events', async () => {
    const secondEvent = await createTestEvent(testUser.id, { name: 'Second Event' });

    const res = await request(app)
      .get('/api/events/all')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    const names = res.body.map((e: any) => e.name);
    expect(names).toEqual(expect.arrayContaining(['Test Event', 'Second Event']));
  });

  it('GET /api/events/all?status=PUBLISHED → should filter events by status', async () => {
    await createTestEvent(testUser.id, { status: 'DRAFT', name: 'Draft Event' });

    const res = await request(app)
      .get('/api/events/all?status=PUBLISHED')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.every((e: any) => e.status === 'PUBLISHED')).toBe(true);
  });

  it('GET /api/events/my → should list my events only', async () => {
    const otherUser = await createTestUser({ email: 'another@example.com' });
    await createTestEvent(otherUser.id, { name: 'Other User Event' });

    const res = await request(app)
      .get('/api/events/my')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.every((e: any) => e.creatorId === testUser.id)).toBe(true);
  });

  it('GET /api/events/my?status=DRAFT → should filter my events by status', async () => {
    await createTestEvent(testUser.id, { status: 'DRAFT', name: 'My Draft Event' });

    const res = await request(app)
      .get('/api/events/my?status=DRAFT')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body.every((e: any) => e.status === 'DRAFT')).toBe(true);
  });
});
