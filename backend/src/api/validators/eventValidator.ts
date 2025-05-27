// src/validators/eventValidator.ts
import { body } from 'express-validator';
import { EventStatus } from '@prisma/client';
//import { CreateEventInput, UpdateEventInput } from '../models/event';

export const createEventValidator = [
  // Required fields
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Event name is required')
    .isLength({ max: 100 })
    .withMessage('Event name cannot exceed 100 characters'),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid date format. Use ISO8601 (e.g., YYYY-MM-DDTHH:MM:SSZ)')
    .custom((value, { req }) => {
      const startDate = new Date(value);
      if (startDate < new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format. Use ISO8601 (e.g., YYYY-MM-DDTHH:MM:SSZ)')
    .custom((value, { req }) => {
      if (value) {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),

  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer')
    .toInt(),

  body('isVirtual')
    .notEmpty()
    .withMessage('isVirtual flag is required')
    .isBoolean()
    .withMessage('isVirtual must be a boolean')
    .toBoolean(),
  body('requiresApproval')
    .notEmpty()
    .withMessage('requiresApproval flag is required')
    .isBoolean()
    .withMessage('requiresApproval must be a boolean')
    .toBoolean(),

  // Conditional and optional fields
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location cannot exceed 255 characters')
    .custom((value, { req }) => {
      if (!req.body.isVirtual && !value) {
        throw new Error('Location is required for in-person events');
      }
      return true;
    }),

  body('virtualLink')
    .optional()
    .isURL()
    .withMessage('Virtual link must be a valid URL')
    .custom((value, { req }) => {
      if (req.body.isVirtual && !value) {
        throw new Error('Virtual link is required for virtual events');
      }
      return true;
    }),

  body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),

  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('Contact email must be a valid email address'),

  body('status')
    .optional()
    .isIn(Object.values(EventStatus))
    .withMessage(`Invalid status. Must be one of: ${Object.values(EventStatus).join(', ')}`)
    .default('DRAFT'),
];

export const updateEventValidator = [
  // All fields are optional for updates, but must be valid if provided
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Event name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Event name cannot exceed 100 characters'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format. Use ISO8601 (e.g., YYYY-MM-DDTHH:MM:SSZ)')
    .custom((value, { req }) => {
      if (value) {
        const startDate = new Date(value);
        if (startDate < new Date()) {
          throw new Error('Start date must be in the future');
        }

        // If updating both dates, validate the order
        if (req.body.endDate) {
          const endDate = new Date(req.body.endDate);
          if (endDate <= startDate) {
            throw new Error('End date must be after start date');
          }
        }
      }
      return true;
    }),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format. Use ISO8601 (e.g., YYYY-MM-DDTHH:MM:SSZ)')
    .custom((value, { req }) => {
      if (value) {
        // If we have startDate in the update, use that, otherwise we'll validate in the controller
        const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
        if (startDate && new Date(value) <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),

  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer')
    .toInt(),

  body('isVirtual')
    .optional()
    .isBoolean()
    .withMessage('isVirtual must be a boolean')
    .toBoolean()
    .custom((value, { req }) => {
      // If changing to virtual, require virtualLink
      if (value === true && !req.body.virtualLink && !req.event?.virtualLink) {
        throw new Error('Virtual link is required when changing to virtual event');
      }
      return true;
    }),
  body('requiresApproval')
    .optional()
    .isBoolean()
    .withMessage('requiresApproval must be a boolean')
    .toBoolean(), // Add this line

  // Optional fields with same validation as create
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location cannot exceed 255 characters')
    .custom((value, { req }) => {
      if (req.body.isVirtual === false && !value && !req.event?.location) {
        throw new Error('Location is required for in-person events');
      }
      return true;
    }),

  body('virtualLink').optional().isURL().withMessage('Virtual link must be a valid URL'),

  body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),

  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('Contact email must be a valid email address'),

  body('status')
    .optional()
    .isIn(Object.values(EventStatus))
    .withMessage(`Invalid status. Must be one of: ${Object.values(EventStatus).join(', ')}`),
];
