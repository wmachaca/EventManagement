// validators/registrationValidator.ts
import { param } from 'express-validator';
import { validate } from '../middleware/validate';

export const applyToEventValidator = [
  param('eventId').isInt().withMessage('Invalid event ID'),
  validate,
];

export const cancelRegistrationValidator = [
  param('eventId').isInt().withMessage('Invalid event ID'),
  validate,
];
