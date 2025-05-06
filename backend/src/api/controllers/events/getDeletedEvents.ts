import { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import { isAuthenticated } from '../../../types/authenticatedRequest';

export const getDeletedEvents = async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.userId;
    const deletedEvents = await eventService.getDeletedEventsByUserId(userId);

    res.json({
      success: true,
      data: deletedEvents,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    res.status(500).json({
      success: false,
      message: 'Failed to fetch deleted events',
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};
