import request from 'supertest';
import app from '../../../src/server';
import { prisma, cleanDatabase, createTestUser, userFixtures } from '../../setup';
import { createTestEvent } from '../../utils/eventTestUtils';
import { createTestApplication } from '../../utils/applicationTestUtils';
import { ApplicationStatus } from '@prisma/client';
import { Event } from '@prisma/client';

describe('DELETE /api/events/:eventId/apply', () => {
  let organizerToken: string;
  let pendingAttendeeToken: string;
  let approvedAttendeeToken: string;
  let unregisteredToken: string;
  let organizerId: number;
  let pendingUserId: number;
  let approvedUserId: number;
  let testEvent: Event;
  let pastEvent: Event;

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
    const [organizer, pendingUser, approvedUser, unregisteredUser] = await Promise.all([
      createTestUser({ name: 'Organizer', email: 'organizer@example.com' }),
      createTestUser({ name: 'Pending Attendee', email: 'pending@example.com' }),
      createTestUser({ name: 'Approved Attendee', email: 'approved@example.com' }),
      createTestUser({ name: 'Unregistered', email: 'unregistered@example.com' }),
    ]);

    organizerId = organizer.id;
    pendingUserId = pendingUser.id;
    approvedUserId = approvedUser.id;

    // Login all users
    [organizerToken, pendingAttendeeToken, approvedAttendeeToken, unregisteredToken] =
      await Promise.all([
        login(organizer.email),
        login(pendingUser.email),
        login(approvedUser.email),
        login(unregisteredUser.email),
      ]);

    // Create test events
    testEvent = await createTestEvent(organizerId, {
      requiresApproval: true,
      capacity: 10,
    });

    pastEvent = await createTestEvent(organizerId, {
      requiresApproval: true,
      startDate: new Date(Date.now() - 86400000), // Yesterday
    });

    // Create applications
    await createTestApplication(pendingUserId, testEvent.id, { status: 'PENDING' });
    await createTestApplication(approvedUserId, testEvent.id, {
      status: 'APPROVED',
      reviewerId: organizerId,
    });
    await createTestApplication(approvedUserId, pastEvent.id, {
      status: 'APPROVED',
      reviewerId: organizerId,
    });

    // Add approved user to attendees
    await prisma.event.update({
      where: { id: testEvent.id },
      data: {
        attendees: {
          connect: { id: approvedUserId },
        },
      },
    });
  });

  afterAll(cleanDatabase);

  describe('Successful cancellations', () => {
    it('should cancel a pending application', async () => {
      const res = await request(app)
        .delete(`/api/events/${testEvent.id}/apply`)
        .set('Authorization', `Bearer ${pendingAttendeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Your registration has been cancelled',
      });

      // Verify application was deleted
      const application = await prisma.eventApplication.findFirst({
        where: {
          eventId: testEvent.id,
          userId: pendingUserId,
        },
      });
      expect(application).toBeNull();
    });

    it('should cancel an approved registration', async () => {
      const res = await request(app)
        .delete(`/api/events/${testEvent.id}/apply`)
        .set('Authorization', `Bearer ${approvedAttendeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Your registration has been cancelled',
      });

      // Verify application was deleted and user removed from attendees
      const [application, event] = await Promise.all([
        prisma.eventApplication.findFirst({
          where: {
            eventId: testEvent.id,
            userId: approvedUserId,
          },
        }),
        prisma.event.findUnique({
          where: { id: testEvent.id },
          include: { attendees: true },
        }),
      ]);

      expect(application).toBeNull();
      expect(event?.attendees.some(a => a.id === approvedUserId)).toBe(false);
    });
  });
  describe('Failure cases', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const res = await request(app).delete(`/api/events/${testEvent.id}/apply`);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error: 'Unauthorized, no token',
      });
    });

    it('should return 400 for invalid event ID format', async () => {
      const res = await request(app)
        .delete('/api/events/invalid-id/apply')
        .set('Authorization', `Bearer ${pendingAttendeeToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: 'Invalid event ID',
      });
    });

    it('should return 404 for non-existent event', async () => {
      const res = await request(app)
        .delete('/api/events/999999/apply')
        .set('Authorization', `Bearer ${pendingAttendeeToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('should return 404 when no registration exists', async () => {
      const res = await request(app)
        .delete(`/api/events/${testEvent.id}/apply`)
        .set('Authorization', `Bearer ${unregisteredToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/No active registration found/i);
    });

    it('should return 403 when event has already started', async () => {
      const res = await request(app)
        .delete(`/api/events/${pastEvent.id}/apply`)
        .set('Authorization', `Bearer ${approvedAttendeeToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/after event has started/i);
    });

    it('should return 404 for deleted events', async () => {
      const deletedEvent = await createTestEvent(organizerId, { isDeleted: true });

      await prisma.eventApplication.create({
        data: {
          eventId: deletedEvent.id,
          userId: pendingUserId,
          status: ApplicationStatus.PENDING,
        },
      });

      const res = await request(app)
        .delete(`/api/events/${deletedEvent.id}/apply`)
        .set('Authorization', `Bearer ${pendingAttendeeToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });
  });

  describe('Edge cases', () => {
    it('should not allow organizer to cancel others registrations', async () => {
      const res = await request(app)
        .delete(`/api/events/${testEvent.id}/apply`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/No active registration found/i);
    });
  });
});
