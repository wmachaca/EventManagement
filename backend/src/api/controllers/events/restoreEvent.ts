import { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import { isAuthenticated } from '../../../types/authenticatedRequest';

export const restoreEvent = async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const eventId = parseInt(req.params.id);
    const restoredEvent = await eventService.restoreEvent(eventId, req.user.userId);

    if (!restoredEvent) {
      return res.status(404).json({
        message: 'Event not found or you are not the creator',
      });
    }

    res.json({
      success: true,
      message: 'Event restored successfully',
      data: {
        event: restoredEvent,
        status: restoredEvent.status,
        isDeleted: restoredEvent.isDeleted,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    res.status(500).json({
      success: false,
      message: 'Failed to restore event',
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};
