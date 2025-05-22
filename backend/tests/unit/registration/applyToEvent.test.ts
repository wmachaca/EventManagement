import request from 'supertest';
import app from '../../../src/server';
import { prisma, cleanDatabase, getAuthToken, createTestUser } from '../../setup';
import { createTestEvent } from '../../utils/eventTestUtils';
import { User } from '@prisma/client';

describe('POST /api/events/:eventId/apply', () => {
  let organizer: User;
  let attendee: User;
  let organizerToken: string;
  let attendeeToken: string;
  let testEvent: any;

  beforeAll(async () => {
    await cleanDatabase();
    
    // Create organizer and attendee
    [organizer, attendee] = await Promise.all([
      createTestUser({ name: 'Organizer', email: 'organizer@example.com' }),
      createTestUser({ name: 'Attendee', email: 'attendee@example.com' })
    ]);
    
    // Get tokens
    [organizerToken, attendeeToken] = await Promise.all([
      login('organizer@example.com'),
      login('attendee@example.com')
    ]);
    
    // Create test event
    testEvent = await createTestEvent(organizer.id, {
      requiresApproval: true,
      capacity: 10
    });
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  it('allows application to event requiring approval', async () => {
    const res = await applyToEvent(testEvent.id, attendeeToken);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('PENDING');
  });

  it('registers user directly if approval not required', async () => {
    const event = await createTestEvent(organizer.id, { requiresApproval: false });
    const res = await applyToEvent(event.id, attendeeToken);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('prevents duplicate applications', async () => {
    await applyToEvent(testEvent.id, attendeeToken); // First
    const res = await applyToEvent(testEvent.id, attendeeToken); // Second
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('prevents applying to full events', async () => {
    const smallEvent = await createTestEvent(organizer.id, {
      requiresApproval: false,
      capacity: 1
    });

    await applyToEvent(smallEvent.id, attendeeToken); // fills the capacity

    const other = await createTestUser({ name: 'Other', email: 'other@example.com' });
    const otherToken = await login('other@example.com');

    const res = await applyToEvent(smallEvent.id, otherToken);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/maximum capacity/i);
  });

  it('prevents applying to deleted events', async () => {
    const deleted = await createTestEvent(organizer.id, { isDeleted: true });
    const res = await applyToEvent(deleted.id, attendeeToken);
    expect(res.status).toBe(404);
  });

  it('requires authentication', async () => {
    const res = await request(app).post(`/api/events/${testEvent.id}/apply`);
    expect(res.status).toBe(401);
  });
});

// --- Helper functions ---

async function login(email: string): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password: 'password' });
  return res.body.data.token;
}

function applyToEvent(eventId: number, token: string) {
  return request(app)
    .post(`/api/events/${eventId}/apply`)
    .set('Authorization', `Bearer ${token}`);
}

