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

// Event validation rules
export const eventValidationRules = [
  // Required fields
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Event name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),

  body('schedule')
    .notEmpty()
    .withMessage('Event schedule is required')
    .isISO8601()
    .withMessage('Invalid date format. Use ISO8601 (e.g., YYYY-MM-DDTHH:MM)')
    .custom(value => {
      const scheduledDate = new Date(value);
      if (scheduledDate < new Date()) {
        throw new Error('Event schedule must be in the future');
      }
      return true;
    }),

  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer').toInt(),

  // Optional fields with validation
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location must be less than 255 characters')
    .custom((value, { req }) => {
      if (!req.body.isVirtual && !value) {
        throw new Error('Location is required for in-person events');
      }
      return true;
    }),

  body('isVirtual').optional().isBoolean().withMessage('Virtual flag must be boolean').toBoolean(),

  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'CANCELED'])
    .withMessage('Invalid status')
    .default('DRAFT'),
];

// Validation handler middleware
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors for better client consumption
    const formattedErrors = errors.array().map(error => {
      // Type guard to handle different error types
      if ('param' in error && 'msg' in error) {
        return {
          field: error.param,
          message: error.msg,
          value: 'value' in error ? error.value : undefined,
        };
      }
      return {
        field: 'unknown',
        message: 'Validation error',
        value: undefined,
      };
    });

    return res.status(400).json({
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
  next();
};

// Additional middleware for event ownership check
