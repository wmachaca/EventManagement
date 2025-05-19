import type { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import { isAuthenticated } from '../../../types/authenticatedRequest';

export const cancelRegistration = async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) return res.status(401).json({ message: 'Unauthorized' });

    const eventId = parseInt(req.params.eventId);
    const userId = req.user.userId;

    const result = await eventService.cancelRegistration(eventId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling registration', error });
  }
};
