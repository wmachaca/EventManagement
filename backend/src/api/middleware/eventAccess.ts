// src/middleware/eventAccess.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { isAuthenticated } from '../../types/authenticatedRequest';


const prisma = new PrismaClient();

// Middleware to check if user is the event creator
export const isEventCreator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isAuthenticated(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }      
    const eventId = parseInt(req.params.eventId || req.params.id);
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error verifying event ownership', error });
  }
};

// Event validation rules
export const eventValidationRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),

  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'CANCELED'])
    .withMessage('Invalid status'),

  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Invalid priority'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .toDate(),
];

// Validation handler middleware
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
