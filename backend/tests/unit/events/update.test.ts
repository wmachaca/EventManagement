import request from 'supertest';
import app from '../../../src/server';
import { prisma, cleanDatabase, getAuthToken, createTestUser, userFixtures } from '../../setup';
import { createTestEvent } from '../../utils/eventTestUtils';
import { updateEventData } from '../../fixtures/events';

describe('Event Update API', () => {
  let authToken: string;
  let testUser: any;
  let testEvent: any;

  beforeAll(async () => {
    await cleanDatabase();

    // Create user and get auth token
    testUser = await createTestUser(userFixtures.existingUser);
    authToken = await getAuthToken();

    // Create event with helper function
    testEvent = await createTestEvent(testUser.id);
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it('should update an event with valid data', async () => {
    const response = await request(app)
      .put(`/api/events/${testEvent.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        ...updateEventData.validUpdate,
        version: testEvent.version,
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updateEventData.validUpdate.name);
    expect(response.body.description).toBe(updateEventData.validUpdate.description);
    expect(response.body.capacity).toBe(updateEventData.validUpdate.capacity);
  });

  it('should fail with 400 for invalid update data', async () => {
    const response = await request(app)
      .put(`/api/events/${testEvent.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateEventData.invalidUpdate);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Validation failed');
  });

  it("should fail with 403 when updating another user's event", async () => {
    // Create another user with proper hashed password
    const otherUser = await createTestUser({
      name: 'Other User',
      email: 'other@example.com',
    });

    // Try logging in using original test password
    const otherToken = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'other@example.com',
        password: userFixtures.validLogin.password,
      })
      .then(res => res.body.data?.token);

    const response = await request(app)
      .put(`/api/events/${testEvent.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send(updateEventData.validUpdate);

    expect(response.status).toBe(403);
  });
  it('should fail if event version is outdated (optimistic concurrency)', async () => {
    const outdatedData = {
      ...updateEventData.validUpdate,
      version: 0, // intentionally wrong version
    };

    const response = await request(app)
      .put(`/api/events/${testEvent.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(outdatedData);

    expect(response.status).toBe(409); // or custom 409 if you handle it
    expect(response.body.message).toContain('concurrently');
  });
});
