import { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import { isAuthenticated } from '../../../types/authenticatedRequest';


export const listEvents = async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }      
    const filter = {
      status: req.query.status as 'DRAFT' | 'PUBLISHED' | 'CANCELED',
      creatorId: req.query.myEvents ? req.user.userId : undefined,
    };
    const events = await eventService.listEvents(filter);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error listing events', error });
  }
};
