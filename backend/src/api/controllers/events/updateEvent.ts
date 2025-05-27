import type { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import type { UpdateEventInput } from '../../../models/event';
import { isAuthenticated } from '../../../types/authenticatedRequest';

export const updateEvent = async (req: Request, res: Response) => {
  try {
    console.log('Request user:', req.user);
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const id = parseInt(req.params.id);
    // Get the existing event first
    const existingEvent = await eventService.getEventById(id);
    if (!existingEvent || existingEvent.creatorId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Ensure version is provided and is a number
    if (req.body.version === undefined || isNaN(Number(req.body.version))) {
      return res
        .status(400)
        .json({ message: 'A valid version number is required for concurrency control.' });
    }

    const requestVersion = Number(req.body.version);

    // Compare version for optimistic concurrency
    if (requestVersion !== existingEvent.version) {
      return res
        .status(409)
        .json({ message: 'Event was updated concurrently. Please refresh and try again.' });
    }
    console.log('RequestVersion and ExistingVerson:', requestVersion, existingEvent.version);

    // Handle image upload if present
    let imageUrl: string | undefined;
    if (req.file) {
      const filename = req.file.filename;
      imageUrl = `/images/${filename}`; // Same path structure as create
    }

    // Prepare update input - merge existing data with updates

    const input: UpdateEventInput = {
      ...req.body,
      version: requestVersion,
      imageUrl: imageUrl || existingEvent.imageUrl,
    };

    console.log('Updating event with:', input);
    const updatedEvent = await eventService.updateEvent(id, input);
    res.json(updatedEvent);
  } catch (error: any) {
    console.error('Detailed error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || 'Error updating event' });
  }
};
