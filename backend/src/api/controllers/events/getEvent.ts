import { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';

export const getEvent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const event = await eventService.getEventById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error });
  }
};
