import request from 'supertest';
import app from '../../../src/server';
import { prisma, cleanDatabase, createTestUser, getAuthToken, userFixtures } from '../../setup';
import { createTestEvent } from '../../utils/eventTestUtils';

describe('DELETE /api/events/:id', () => {
  let authToken: string;
  let testUser: any;
  let testEvent: any;

  beforeAll(async () => {
    await cleanDatabase();

    // Create user and get auth token
    testUser = await createTestUser(userFixtures.existingUser);
    authToken = await getAuthToken(); // for testUser

    // Create event with helper function
    testEvent = await createTestEvent(testUser.id);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  it('should soft delete an event by the creator', async () => {
    const response = await request(app)
      .delete(`/api/events/${testEvent.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.event.isDeleted).toBe(true);
    expect(response.body.data.deletedAt).toBeDefined();

    // Verify in database
    const dbEvent = await prisma.event.findUnique({
      where: { id: testEvent.id },
    });
    expect(dbEvent?.isDeleted).toBe(true);
  });

  it("should return 403 if user tries to delete another user's event", async () => {
    // Create another user with proper hashed password
    const otherUser = await createTestUser({
      name: 'Other User',
      email: 'other@example.com',
    });

    // Create event with helper function
    const otherEvent = await createTestEvent(otherUser.id);

    // Try to delete with first user's token
    const response = await request(app)
      .delete(`/api/events/${otherEvent.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(403);
  });

  it('should return 404 if event does not exist', async () => {
    const response = await request(app)
      .delete('/api/events/99999')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
  });
});
