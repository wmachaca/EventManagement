import type { Request, Response } from 'express';
import * as eventService from '../../../services/eventService';
import type { CreateEventInput } from '../../../models/event';
import { isAuthenticated } from '../../../types/authenticatedRequest';

export const createEvent = async (req: Request, res: Response) => {
  try {
    //console.log('Request headers:', req.headers);
    //console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Ensure req.user.userId exists and is a number
    if (!req.user?.userId || typeof req.user.userId !== 'number') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Validate event fields (not image): made in server

    // Local image URL construction
    let imageUrl: string | undefined;
    if (req.file) {
      const filename = req.file.filename;
      imageUrl = `/images/${filename}`; // Relative path to serve from public/
    }

    const input: CreateEventInput = {
      ...req.body,
      creatorId: req.user.userId,
      imageUrl,
    };
    console.log('Creating event with:', input);
    const event = await eventService.createEvent(input);
    res.status(201).json(event);
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ message: 'Error creating event', error });
  }
};
