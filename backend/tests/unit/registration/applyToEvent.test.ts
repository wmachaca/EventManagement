import request from 'supertest';
import app from '../../../src/server';
import { prisma, cleanDatabase, createTestUser, userFixtures } from '../../setup';
import { createTestEvent } from '../../utils/eventTestUtils';

describe('POST /api/events/:eventId/apply', () => {
  let ownerToken: string;
  let attendee1Token: string;
  let attendee2Token: string;
  let ownerId: number;
  let attendee1Id: number;

  const login = async (email: string): Promise<string> => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: userFixtures.validLogin.password });
    return res.body.data.token;
  };

  const applyToEvent = (eventId: number, token: string, message?: string) =>
    request(app)
      .post(`/api/events/${eventId}/apply`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message });

  beforeAll(async () => {
    await cleanDatabase();

    const [owner, attendee1, attendee2] = await Promise.all([
      createTestUser({ name: 'Owner', email: 'owner@example.com' }),
      createTestUser({ name: 'Attendee1', email: 'attendee1@example.com' }),
      createTestUser({ name: 'Attendee2', email: 'attendee2@example.com' }),
    ]);

    ownerId = owner.id;
    attendee1Id = attendee1.id;
    [ownerToken, attendee1Token, attendee2Token] = await Promise.all([
      login('owner@example.com'),
      login('attendee1@example.com'),
      login('attendee2@example.com'),
    ]);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  it('should apply to an event successfully', async () => {
    const event = await createTestEvent(ownerId, { requiresApproval: true });
    const res = await applyToEvent(event.id, attendee1Token);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING');

    const application = await prisma.eventApplication.findFirst({
      where: { eventId: event.id, userId: attendee1Id },
    });

    expect(application?.status).toBe('PENDING');
  });

  it('should auto-approve application when approval is not required', async () => {
    const event = await createTestEvent(ownerId, { requiresApproval: false, capacity: 10 });
    const res = await applyToEvent(event.id, attendee1Token);

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('should allow the owner to apply as an attendee if desired', async () => {
    const selfJoinEvent = await createTestEvent(ownerId, { requiresApproval: false });
    const res = await applyToEvent(selfJoinEvent.id, ownerToken);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('should not allow duplicate applications', async () => {
    const event = await createTestEvent(ownerId);
    await applyToEvent(event.id, attendee1Token); // First apply
    const res = await applyToEvent(event.id, attendee1Token); // Duplicate

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already/i);
  });

  it('should return 400 for invalid eventId', async () => {
    const res = await request(app)
      .post('/api/events/invalid/apply')
      .set('Authorization', `Bearer ${attendee1Token}`);

    expect(res.statusCode).toBe(400);
  });

  it('should return 401 for unauthenticated requests', async () => {
    const event = await createTestEvent(ownerId);
    const res = await request(app).post(`/api/events/${event.id}/apply`);
    expect(res.statusCode).toBe(401);
  });

  it('should return 404 for non-existent event', async () => {
    const res = await applyToEvent(99999, attendee1Token);
    expect(res.statusCode).toBe(404);
  });
  it('should prevent applications to full events', async () => {
    const event = await createTestEvent(ownerId, { requiresApproval: false, capacity: 1 });
    await applyToEvent(event.id, attendee1Token);

    const res = await applyToEvent(event.id, attendee2Token);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/maximum capacity/i);
  });

  it('should prevent applications to unpublished events', async () => {
    const draftEvent = await createTestEvent(ownerId, { status: 'DRAFT' });
    const res = await applyToEvent(draftEvent.id, attendee1Token);
    expect(res.status).toBe(403);
  });

  it('should prevent applications to canceled events', async () => {
    const canceledEvent = await createTestEvent(ownerId, { status: 'CANCELED' });
    const res = await applyToEvent(canceledEvent.id, attendee1Token);
    expect(res.status).toBe(403);
  });

  it('should prevent applications to deleted events', async () => {
    const deletedEvent = await createTestEvent(ownerId, { isDeleted: true });
    const res = await applyToEvent(deletedEvent.id, attendee1Token);
    expect(res.status).toBe(404);
  });
  /*
    it('should handle concurrent applications correctly', async () => {
      const limitedEvent = await createTestEvent(organizer.id, {
        capacity: 1,
        requiresApproval: false
      });

      // Simulate concurrent requests
      const [response1, response2] = await Promise.all([
        applyToEvent(limitedEvent.id, attendeeToken),
        applyToEvent(limitedEvent.id, reviewerToken)
      ]);

      // Only one should succeed
      expect([response1.status, response2.status]).toContain(201);
      expect([response1.status, response2.status]).toContain(403);

      // Verify only one application was created
      const applications = await prisma.eventApplication.findMany({
        where: { eventId: limitedEvent.id }
      });
      expect(applications.length).toBe(1);
    });
  });*/
});
