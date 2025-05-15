// src/middleware/eventAccess.ts
import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../types/authenticatedRequest';

const prisma = new PrismaClient();

// Middleware to attach event to request if it exists
export const eventExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = parseInt(req.params.eventId || req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    (req as Request & { event: typeof event }).event = event;
    next();
  } catch (error) {
    console.error('Error in eventExists:', error);
    res.status(500).json({ message: 'Error finding event', error });
  }
};

// Middleware to check if user is the event creator
export const isEventCreator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const eventId = parseInt(req.params.eventId || req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creatorId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized - not the event creator' });
    }

    next();
  } catch (error) {
    console.error('Error in isEventCreator:', error);
    res.status(500).json({ message: 'Error verifying event ownership', error });
  }
};
// Additional middleware for event ownership check
