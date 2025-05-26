import { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import { isAuthenticated } from '../../../types/authenticatedRequest';

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const eventId = parseInt(req.params.id);
    const deletedEvent = await eventService.deleteEvent(eventId, req.user.userId);

    if (!deletedEvent) {
      return res.status(404).json({
        message: 'Event not found or you are not the creator',
      });
    }

    res.json({
      success: true,
      message: 'Event soft-deleted successfully',
      data: {
        event: deletedEvent,
        deletedAt: deletedEvent.deletedAt,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};
