import type { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import { isAuthenticated } from '../../../types/authenticatedRequest';

export const checkUserRegistration = async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) return res.status(401).json({ message: 'Unauthorized' });

    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    const userId = req.user.userId;

    const isRegistered = await eventService.checkUserRegistration(eventId, userId);
    return res.status(200).json({ isRegistered });
  } catch (error: any) {
    console.error('Check registration error:', error);
    return res.status(500).json({
      message: error.message || 'Error checking registration',
    });
  }
};
