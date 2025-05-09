// controllers/events/listAllEvents.ts
import { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';

export const listAllEvents = async (req: Request, res: Response) => {
  try {
    const filter = {
      status: req.query.status as 'DRAFT' | 'PUBLISHED' | 'CANCELED',
    };

    const events = await eventService.listEvents(filter);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
};
