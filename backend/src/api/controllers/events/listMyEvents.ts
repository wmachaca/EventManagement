// controllers/events/listMyEvents.ts
import { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import { isAuthenticated } from '../../../types/authenticatedRequest';

export const listMyEvents = async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const filter = {
      creatorId: req.user.userId,
      status: req.query.status as 'DRAFT' | 'PUBLISHED' | 'CANCELED'
    };

    const events = await eventService.listEvents(filter);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user events', error });
  }
};
