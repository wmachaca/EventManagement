import type { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import type { EventApplicationInput } from '../../../models/event';
import { isAuthenticated } from '../../../types/authenticatedRequest';

export const applyToEvent = async (req: Request, res: Response) => {
  // ✅ Check authentication
  if (!isAuthenticated(req)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  // ✅ Validate and parse eventId
  const eventId = parseInt(req.params.eventId, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid event ID',
    });
  }

  // ✅ Now safely construct EventApplicationInput
  const input: EventApplicationInput = {
    eventId,
    userId: req.user.userId,
  };

  try {
    const application = await eventService.applyToEvent(input.eventId, input.userId);

    return res.status(201).json({
      success: true,
      data: application,
      message:
        application.status === 'PENDING'
          ? 'Your application has been submitted for review'
          : 'You have been registered for the event',
    });
  } catch (error: any) {
    console.error('Apply to event error:', error);

    const message = error.message || 'Failed to apply to event';

    // ✅ Map known error messages to HTTP status codes
    const statusMap: { [key: string]: number } = {
      'Event not found or has been deleted': 404,
      'Invalid event ID': 400,
      'Event is not open for registration': 403,
      'Event has reached maximum capacity': 403,
    };

    const status =
      Object.keys(statusMap).find(key => message.includes(key)) !== undefined
        ? statusMap[message]
        : message.includes('already') || message.includes('application')
          ? 409
          : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};
