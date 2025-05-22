import request from 'supertest';
import app from '../../../src/server';
import { prisma, cleanDatabase, getAuthToken } from '../../setup';
import { createTestEventWithApplications } from '../../utils/applicationTestUtils';

describe('Cancel Registration API', () => {
  let attendeeToken: string;
  let testData: any;

  beforeAll(async () => {
    await cleanDatabase();
    testData = await createTestEventWithApplications();
    
    attendeeToken = await request(app)
      .post('/api/auth/login')
      .send({ email: 'attendee1@example.com', password: 'password' })
      .then(res => res.body.data?.token);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('DELETE /api/events/:eventId/apply', () => {
    it('should allow user to cancel their application', async () => {
      const response = await request(app)
        .delete(`/api/events/${testData.event.id}/apply`)
        .set('Authorization', `Bearer ${attendeeToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('successfully canceled');

      // Verify in database
      const application = await prisma.eventApplication.findFirst({
        where: {
          eventId: testData.event.id,
          userId: testData.attendees[0].id
        }
      });
      expect(application).toBeNull();
    });

    it('should prevent canceling non-existent applications', async () => {
      // User who hasn't applied
      const newUser = await prisma.user.create({
        data: {
          name: 'New User',
          email: 'new@example.com',
          provider: 'credentials',
          auth: {
            create: {
              password: 'hashedpassword',
              salt: 'somesalt'
            }
          }
        }
      });
      
      const newUserToken = await request(app)
        .post('/api/auth/login')
        .send({ email: 'new@example.com', password: 'password' })
        .then(res => res.body.data?.token);
      
      const response = await request(app)
        .delete(`/api/events/${testData.event.id}/apply`)
        .set('Authorization', `Bearer ${newUserToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/events/${testData.event.id}/apply`);
      
      expect(response.status).toBe(401);
    });

    it('should prevent canceling after event has started', async () => {
      // Create past event
      const pastEvent = await prisma.event.create({
        data: {
          name: 'Past Event',
          startDate: new Date(Date.now() - 86400000), // Yesterday
          capacity: 10,
          creatorId: testData.organizer.id,
          status: 'PUBLISHED'
        }
      });
      
      // Create application
      await prisma.eventApplication.create({
        data: {
          eventId: pastEvent.id,
          userId: testData.attendees[0].id,
          status: 'APPROVED'
        }
      });
      
      const response = await request(app)
        .delete(`/api/events/${pastEvent.id}/apply`)
        .set('Authorization', `Bearer ${attendeeToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.message).toContain('already started');
    });
  });
});