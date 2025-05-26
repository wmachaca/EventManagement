import request from 'supertest';
import app from '../../../src/server'; // Match path from applyToEvent.test.ts
import { prisma, cleanDatabase, createTestUser, userFixtures } from '../../setup';
import { createTestEvent } from '../../utils/eventTestUtils';
import { ApplicationStatus } from '@prisma/client';

describe('GET /api/events/:eventId/registration', () => {
  let organizerToken: string;
  let pendingToken: string;
  let approvedToken: string;
  let rejectedToken: string;
  let unregisteredToken: string;
  let organizerId: number;
  let userIds: number[];

  const login = async (email: string): Promise<string> => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: userFixtures.validLogin.password });
    return res.body.data.token;
  };

  beforeAll(async () => {
    await cleanDatabase();

    // Create users
    const [organizer, user1, user2, user3, user4] = await Promise.all([
      createTestUser({ name: 'Organizer', email: 'organizer@example.com' }),
      createTestUser({ name: 'Pending', email: 'pending@example.com' }),
      createTestUser({ name: 'Approved', email: 'approved@example.com' }),
      createTestUser({ name: 'Rejected', email: 'rejected@example.com' }),
      createTestUser({ name: 'Unregistered', email: 'unregistered@example.com' }),
    ]);

    organizerId = organizer.id;
    userIds = [user1.id, user2.id, user3.id, user4.id];

    // Log in users
    [organizerToken, pendingToken, approvedToken, rejectedToken, unregisteredToken] =
      await Promise.all([
        login(organizer.email),
        login(user1.email),
        login(user2.email),
        login(user3.email),
        login(user4.email),
      ]);

    // Create event
    const event = await createTestEvent(organizerId, { requiresApproval: true });

    // Create applications
    await prisma.eventApplication.createMany({
      data: [
        { userId: user1.id, eventId: event.id, status: 'PENDING' },
        { userId: user2.id, eventId: event.id, status: 'APPROVED', reviewedById: organizer.id },
        { userId: user3.id, eventId: event.id, status: 'REJECTED', reviewedById: organizer.id },
      ],
    });

    // Attach event to global scope
    (global as any).testEvent = event;
  });

  afterAll(cleanDatabase);

  describe('Successful checks', () => {
    it('returns PENDING for pending applicants', async () => {
      const res = await request(app)
        .get(`/api/events/${(global as any).testEvent.id}/registration`)
        .set('Authorization', `Bearer ${pendingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ isRegistered: true, status: 'PENDING' });
    });

    it('returns APPROVED for approved applicants', async () => {
      const res = await request(app)
        .get(`/api/events/${(global as any).testEvent.id}/registration`)
        .set('Authorization', `Bearer ${approvedToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ isRegistered: true, status: 'APPROVED' });
    });

    it('returns REJECTED for rejected applicants', async () => {
      const res = await request(app)
        .get(`/api/events/${(global as any).testEvent.id}/registration`)
        .set('Authorization', `Bearer ${rejectedToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ isRegistered: true, status: 'REJECTED' });
    });

    it('returns not registered for others', async () => {
      const res = await request(app)
        .get(`/api/events/${(global as any).testEvent.id}/registration`)
        .set('Authorization', `Bearer ${unregisteredToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ isRegistered: false, status: null });
    });
  });

  describe('Edge case: no-approval event', () => {
    it('should return APPROVED status immediately for open events', async () => {
      const openEvent = await createTestEvent(organizerId, {
        requiresApproval: false,
        capacity: 5,
      });

      // This will create an application that gets auto-approved
      const applyRes = await request(app)
        .post(`/api/events/${openEvent.id}/apply`)
        .set('Authorization', `Bearer ${pendingToken}`);

      // Now check the status
      const checkRes = await request(app)
        .get(`/api/events/${openEvent.id}/registration`)
        .set('Authorization', `Bearer ${pendingToken}`);

      expect(checkRes.status).toBe(200);
      expect(checkRes.body).toMatchObject({
        success: true,
        data: { isRegistered: true, status: 'APPROVED' },
      });
    });
  });

  describe('Failure cases', () => {
    it('requires authentication', async () => {
      const res = await request(app).get(
        `/api/events/${(global as any).testEvent.id}/registration`,
      );

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/unauthorized/i);
    });

    it('fails with invalid event ID', async () => {
      const res = await request(app)
        .get('/api/events/not-an-id/registration')
        .set('Authorization', `Bearer ${approvedToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid event id/i);
    });

    it('returns 404 for nonexistent event', async () => {
      const res = await request(app)
        .get('/api/events/999999/registration')
        .set('Authorization', `Bearer ${approvedToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });
  });
});
