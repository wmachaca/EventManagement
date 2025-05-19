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

    const application = await eventService.applyToEvent(input.eventId, input.userId);
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error applying to event', error });
  }
};
