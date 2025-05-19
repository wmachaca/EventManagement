import type { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import type { EventApplicationInput } from '../../../models/event';
import { isAuthenticated } from '../../../types/authenticatedRequest';

export const applyToEvent = async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const input: EventApplicationInput = {
      eventId: parseInt(req.params.eventId),
      userId: req.user.userId,
    };

    // Validate input
    if (isNaN(input.eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const application = await eventService.applyToEvent(input.eventId, input.userId);
    return res.status(201).json(application);
  } catch (error: any) {
    console.error('Apply to event error:', error);
    const status = error.message.includes('not found')
      ? 404
      : error.message.includes('already registered')
        ? 409
        : error.message.includes('full capacity')
          ? 403
          : 500;
    return res.status(status).json({
      message: error.message || 'Error applying to event',
    });
  }
};
