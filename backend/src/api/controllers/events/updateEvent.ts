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
    // Handle image upload if present
    let imageUrl: string | undefined;
    if (req.file) {
      const filename = req.file.filename;
      imageUrl = `/images/${filename}`; // Same path structure as create
    }
    // Prepare update input - merge existing data with updates

    if (req.body.version && isNaN(Number(req.body.version))) {
      return res.status(400).json({ message: 'Invalid version number' });
    }

    const input: UpdateEventInput = {
      ...req.body,
      // Only update imageUrl if a new file was uploaded
      version: req.body.version ? Number(req.body.version) : undefined,
      imageUrl: imageUrl || existingEvent.imageUrl,
    };

    console.log('Updating event with:', input);
    const updatedEvent = await eventService.updateEvent(id, input);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ message: 'Error updating event', error });
  }
};
