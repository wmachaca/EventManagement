import { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import { isAuthenticated } from '../../../types/authenticatedRequest';


export const getApplications = async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }       
    const eventId = parseInt(req.params.eventId);

    const event = await eventService.getEventById(eventId);
    if (!event || event.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const applications = await eventService.getEventApplications(eventId);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error });
  }
};
