// tests/unit/events/create.test.ts
import { createEvent } from '@/services/eventService';
import { sampleEventData } from '../../fixtures/events';

describe('Event Service', () => {
  describe('createEvent', () => {
    it('should create a new event', async () => {
      const eventData = sampleEventData[0];
      const event = await createEvent({
        ...eventData,
        creatorId: 1,
      });

      expect(event).toHaveProperty('id');
      expect(event.name).toBe(eventData.name);
      expect(event.creatorId).toBe(1);
    });

    it('should throw error for missing creatorId', async () => {
      await expect(createEvent({
        ...sampleEventData[0],
        creatorId: undefined as any,
      })).rejects.toThrow('Creator ID is required');
    });
  });
});