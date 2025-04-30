import { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import { UpdateEventInput } from '../../../models/event';
import { isAuthenticated } from '../../../types/authenticatedRequest';

export const updateEvent = async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }       
    const id = parseInt(req.params.id);
    const input: UpdateEventInput = req.body;

    const event = await eventService.getEventById(id);
    if (!event || event.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedEvent = await eventService.updateEvent(id, input);
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error });
  }
};
