import type { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import { isAuthenticated } from '../../../types/authenticatedRequest';
import { ApplicationError } from '../../../errors/ApplicationError';

export const cancelRegistration = async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      throw new ApplicationError('Unauthorized', 401);
    }

    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      throw new ApplicationError('Invalid event ID', 400);
    }

    await eventService.cancelRegistration(eventId, req.user.userId);

    return res.status(200).json({
      success: true,
      message: 'Your registration has been cancelled',
    });
  } catch (error: any) {
    console.error('Cancel registration error:', error);

    const status = error instanceof ApplicationError ? error.statusCode : 500;

    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to cancel registration',
    });
  }
};
