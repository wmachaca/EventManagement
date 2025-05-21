// tests/unit/registration/apply.test.ts
import { applyToEvent } from '@/services/eventService';
import { prisma } from '../../setup';

describe('Registration Service', () => {
  beforeAll(async () => {
    // Create test event and user
    await prisma.event.create({
      data: {
        name: 'Test Event',
        startDate: new Date('2025-12-01'),
        capacity: 10,
        creatorId: 1,
        status: 'PUBLISHED',
      },
    });
  });

  it('should register user for an event', async () => {
    const application = await applyToEvent(1, 2); // eventId 1, userId 2
    
    expect(application).toHaveProperty('id');
    expect(application.status).toBe('APPROVED');
  });

  it('should prevent duplicate registrations', async () => {
    await expect(applyToEvent(1, 2)) // Same user and event
      .rejects.toThrow('already registered');
  });
});