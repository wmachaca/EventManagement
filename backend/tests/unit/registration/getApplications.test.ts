import request from 'supertest';
import app from '../../../src/server';
import { prisma, cleanDatabase, createTestUser, userFixtures } from '../../setup';
import { createTestEvent } from '../../utils/eventTestUtils';
import { createTestApplication } from '../../utils/applicationTestUtils';
import { ApplicationStatus } from '@prisma/client';
import { addDays } from 'date-fns';

describe('GET /api/events/:eventId/applications', () => {
  // Test tokens
  let organizerToken: string;
  let attendeeToken: string;
  let otherUserToken: string;

  // Test user IDs
  let organizerId: number;
  let attendeeId: number;
  let otherUserId: number;

  // Test events
  let testEvent: any;
  let pastEvent: any;
  let draftEvent: any;
  let fullCapacityEvent: any;

  // Helper function for login
  const login = async (email: string): Promise<string> => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: userFixtures.validLogin.password });
    return res.body.data.token;
  };

  beforeAll(async () => {
    await cleanDatabase();

    // Create test users
    const [organizer, attendee, otherUser] = await Promise.all([
      createTestUser({ name: 'Organizer', email: 'organizer@example.com' }),
      createTestUser({ name: 'Attendee', email: 'attendee@example.com' }),
      createTestUser({ name: 'Other User', email: 'other@example.com' }),
    ]);

    organizerId = organizer.id;
    attendeeId = attendee.id;
    otherUserId = otherUser.id;

    // Login all users
    [organizerToken, attendeeToken, otherUserToken] = await Promise.all([
      login(organizer.email),
      login(attendee.email),
      login(otherUser.email),
    ]);

    // Create test events with different configurations
    [testEvent, pastEvent, draftEvent, fullCapacityEvent] = await Promise.all([
      createTestEvent(organizerId, {
        name: 'Test Event',
        requiresApproval: true,
        capacity: 10,
        status: 'PUBLISHED',
        startDate: addDays(new Date(), 7),
      }),
      createTestEvent(organizerId, {
        name: 'Past Event',
        requiresApproval: true,
        status: 'PUBLISHED',
        startDate: new Date(Date.now() - 86400000), // Yesterday
      }),
      createTestEvent(organizerId, {
        name: 'Draft Event',
        status: 'DRAFT',
      }),
      createTestEvent(organizerId, {
        name: 'Full Capacity Event',
        capacity: 1,
        status: 'PUBLISHED',
      }),
    ]);

    // Create applications with different statuses
    await Promise.all([
      // Test event applications
      createTestApplication(attendeeId, testEvent.id, { status: 'PENDING' }),
      createTestApplication(otherUserId, testEvent.id, {
        status: 'REJECTED',
        reviewerId: organizerId,
      }),

      // Past event applications
      createTestApplication(attendeeId, pastEvent.id, {
        status: 'APPROVED',
        reviewerId: organizerId,
      }),

      // Full capacity event
      createTestApplication(attendeeId, fullCapacityEvent.id, {
        status: 'APPROVED',
        reviewerId: organizerId,
      }),
    ]);

    // Add approved users to attendees for relevant events
    await Promise.all([
      prisma.event.update({
        where: { id: pastEvent.id },
        data: {
          attendees: {
            connect: { id: attendeeId },
          },
        },
      }),
      prisma.event.update({
        where: { id: fullCapacityEvent.id },
        data: {
          attendees: {
            connect: { id: attendeeId },
          },
        },
      }),
    ]);
  });

  afterAll(cleanDatabase);

  describe('Successful requests', () => {
    it('should return all applications for published event (organizer)', async () => {
      const res = await request(app)
        .get(`/api/events/${testEvent.id}/applications`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            status: 'PENDING',
            user: expect.objectContaining({ id: attendeeId }),
          }),
          expect.objectContaining({
            status: 'REJECTED',
            user: expect.objectContaining({ id: otherUserId }),
          }),
        ]),
      );
    });

    it('should return empty array for event with no applications', async () => {
      const newEvent = await createTestEvent(organizerId, { status: 'PUBLISHED' });

      const res = await request(app)
        .get(`/api/events/${newEvent.id}/applications`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return applications for past events (organizer)', async () => {
      const res = await request(app)
        .get(`/api/events/${pastEvent.id}/applications`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        expect.objectContaining({
          status: 'APPROVED',
          user: expect.objectContaining({ id: attendeeId }),
        }),
      ]);
    });

    it('should return paginated results when pagination params are provided', async () => {
      const paginatedEvent = await createTestEvent(organizerId, {
        name: 'Paginated Event',
        requiresApproval: true,
        capacity: 10,
        status: 'PUBLISHED',
        startDate: addDays(new Date(), 7),
      });
      // Create multiple applications for pagination test
      const users = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          createTestUser({ email: `pagination${i}@example.com` }),
        ),
      );

      await Promise.all(
        users.map(user => createTestApplication(user.id, paginatedEvent.id, { status: 'PENDING' })),
      );

      const res = await request(app)
        .get(`/api/events/${paginatedEvent.id}/applications?page=1&limit=2`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe('Authorization failures', () => {
    it('should return 403 when non-organizer tries to access applications', async () => {
      const res = await request(app)
        .get(`/api/events/${testEvent.id}/applications`)
        .set('Authorization', `Bearer ${attendeeToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        message: 'Unauthorized',
      });
    });

    it('should return 403 when other user tries to access applications', async () => {
      const res = await request(app)
        .get(`/api/events/${testEvent.id}/applications`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        message: 'Unauthorized',
      });
    });

    it('should return 404 for non-existent event (organizer)', async () => {
      const res = await request(app)
        .get('/api/events/999999/applications')
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        message: 'Event not found',
      });
    });

    it('should return 403 for draft event (organizer)', async () => {
      const res = await request(app)
        .get(`/api/events/${draftEvent.id}/applications`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        message: 'Unauthorized',
      });
    });
  });

  describe('Authentication failures', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get(`/api/events/${testEvent.id}/applications`);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error: 'Unauthorized, no token',
      });
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get(`/api/events/${testEvent.id}/applications`)
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error: 'Unauthorized, token failed',
      });
    });
  });

  describe('Request validation', () => {
    it('should return 400 for invalid event ID format', async () => {
      const res = await request(app)
        .get('/api/events/invalid-id/applications')
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: 'Invalid event ID',
      });
    });

    it('should return 400 for invalid pagination parameters', async () => {
      const res = await request(app)
        .get(`/api/events/${testEvent.id}/applications?page=invalid&limit=invalid`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.status).toBe(400);
    });
  });
});
