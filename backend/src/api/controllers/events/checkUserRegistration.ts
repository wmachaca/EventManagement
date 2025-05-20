import type { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import { isAuthenticated } from '../../../types/authenticatedRequest';
import { ApplicationError } from '../../../errors/ApplicationError';

export const checkUserRegistration = async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      throw new ApplicationError('Unauthorized', 401);
    }

    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      throw new ApplicationError('Invalid event ID', 400);
    }
    const registrationInfo = await eventService.checkUserRegistration(eventId, req.user.userId);

    res.status(200).json({
      success: true,
      data: registrationInfo,
    });
  } catch (error: any) {
    console.error('Check registration error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to check registration status',
    });
  }
};
