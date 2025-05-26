import request from 'supertest';
import app from '../../../src/server';
import { prisma, cleanDatabase, createTestUser, userFixtures } from '../../setup';
import { createTestEvent } from '../../utils/eventTestUtils';
import { createTestApplication } from '../../utils/applicationTestUtils';
import { ApplicationStatus } from '@prisma/client';

describe('PUT /api/events/applications/:applicationId', () => {
  let organizerToken: string;
  let attendeeToken: string;
  let attendee1Token: string;
  let organizerId: number;
  let attendeeId: number;
  let attendee1Id: number;
  let testEvent: any;
  let pendingApplication: any;
  let pending1Application: any;

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
    const [organizer, attendee, attendee1] = await Promise.all([
      createTestUser({ email: 'organizer@test.com' }),
      createTestUser({ email: 'attendee@test.com' }),
      createTestUser({ email: 'attendee1@test.com' }),
    ]);

    organizerId = organizer.id;
    attendeeId = attendee.id;
    attendee1Id = attendee1.id;

    // Login all users
    [organizerToken, attendeeToken, attendee1Token] = await Promise.all([
      login(organizer.email),
      login(attendee.email),
      login(attendee1.email),
    ]);

    // Create test event
    testEvent = await createTestEvent(organizerId, {
      name: 'Test Event',
      requiresApproval: true,
      status: 'PUBLISHED',
    });

    // Create test application
    pendingApplication = await createTestApplication(attendeeId, testEvent.id, {
      status: ApplicationStatus.PENDING,
    });
    pending1Application = await createTestApplication(attendee1Id, testEvent.id, {
      status: ApplicationStatus.PENDING,
    });
  });

  afterAll(cleanDatabase);

  describe('Successful status updates', () => {
    it('should approve a pending application', async () => {
      const res = await request(app)
        .put(`/api/events/applications/${pendingApplication.id}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          status: ApplicationStatus.APPROVED,
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Application status updated successfully',
        data: expect.objectContaining({
          status: 'APPROVED',
          reviewedAt: expect.any(String),
        }),
      });
    });

    it('should reject a pending application', async () => {
      // Create another application to test rejection

      const res = await request(app)
        .put(`/api/events/applications/${pending1Application.id}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          status: ApplicationStatus.REJECTED,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('REJECTED');
    });
  });

  describe('Authorization failures', () => {
    it('should return 403 when non-organizer tries to update status', async () => {
      const res = await request(app)
        .put(`/api/events/applications/${pendingApplication.id}`)
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send({
          status: ApplicationStatus.APPROVED,
        });

      expect(res.status).toBe(403);
    });

    it('should return 403 for draft event applications', async () => {
      const draftEvent = await createTestEvent(organizerId, { status: 'DRAFT' });
      const draftApp = await createTestApplication(attendeeId, draftEvent.id);

      const res = await request(app)
        .put(`/api/events/applications/${draftApp.id}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          status: ApplicationStatus.APPROVED,
        });

      expect(res.status).toBe(403);
    });
  });

  describe('Validation failures', () => {
    it('should return 400 for invalid application ID', async () => {
      const res = await request(app)
        .put('/api/events/applications/invalid-id')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          status: ApplicationStatus.APPROVED,
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid status', async () => {
      const res = await request(app)
        .put(`/api/events/applications/${pendingApplication.id}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          status: 'INVALID_STATUS',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('validStatuses');
    });

    it('should return 400 for invalid status transition', async () => {
      // First approve the application
      await request(app)
        .put(`/api/events/applications/${pendingApplication.id}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          status: ApplicationStatus.APPROVED,
        });

      // Then try to approve again (invalid transition)
      const res = await request(app)
        .put(`/api/events/applications/${pendingApplication.id}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          status: ApplicationStatus.APPROVED,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('currentStatus');
      expect(res.body).toHaveProperty('validTransitions');
    });
  });

  describe('Authentication failures', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).put(`/api/events/applications/${pendingApplication.id}`).send({
        status: ApplicationStatus.APPROVED,
        reviewedById: organizerId,
      });

      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .put(`/api/events/applications/${pendingApplication.id}`)
        .set('Authorization', 'Bearer invalid-token')
        .send({
          status: ApplicationStatus.APPROVED,
          reviewedById: organizerId,
        });

      expect(res.status).toBe(401);
    });
  });
});
