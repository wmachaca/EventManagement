import type { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import { isAuthenticated } from '../../../types/authenticatedRequest';

export const getApplications = async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const eventId = parseInt(req.params.eventId);

    const rawPage = req.query.page as string | undefined;
    const rawLimit = req.query.limit as string | undefined;

    const page = rawPage ? parseInt(rawPage, 10) : 1;
    const limit = rawLimit ? parseInt(rawLimit, 10) : 10;

    if ((rawPage && (isNaN(page) || page <= 0)) || (rawLimit && (isNaN(limit) || limit <= 0))) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }

    const offset = (page - 1) * limit;

    const event = await eventService.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creatorId !== req.user.userId || event.status !== 'PUBLISHED') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const applications = await eventService.getEventApplications(eventId, limit, offset);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error });
  }
};
