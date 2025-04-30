import { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import { CreateEventInput } from '../../../models/event';
import { isAuthenticated } from '../../../types/authenticatedRequest';

export const createEvent = async (req: Request, res: Response) => {
  try {
   if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }    
    const input: CreateEventInput = {
      ...req.body,
      creatorId: req.user.id,
    };
    const event = await eventService.createEvent(input);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error });
  }
};
