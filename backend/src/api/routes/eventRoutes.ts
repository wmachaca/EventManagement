import { Router } from 'express';
import {
  createEvent,
  listMyEvents,
  listAllEvents,
  getEvent,
  updateEvent,
  applyToEvent,
  getApplications,
  updateApplicationStatus,
  deleteEvent,
  restoreEvent,
  getDeletedEvents,
  checkUserRegistration,
  cancelRegistration,
} from '../controllers/events/index';
import { authMiddleware } from '../middleware/authMiddleware';
import { eventExists, isEventCreator } from '../middleware/eventAccess';
import { validate } from '../middleware/validate';
import { uploadSingleImage } from '../middleware/upload';
import { createEventValidator, updateEventValidator } from '../validators/eventValidator';
import {
  applyToEventValidator,
  cancelRegistrationValidator,
} from '../validators/registrationValidator';
const router = Router();

// Applies to all routes below
router.use(authMiddleware);

// Event CRUD
router.post('/', uploadSingleImage, createEventValidator, validate, createEvent);
//router.get('/', listEvents);
router.get('/my', listMyEvents);
router.get('/all', listAllEvents);
router.get('/trash', getDeletedEvents);
router.get('/:id', eventExists, getEvent);
router.put(
  '/:id',
  eventExists,
  isEventCreator,
  uploadSingleImage,
  updateEventValidator,
  validate,
  updateEvent,
);

// Event applications
router.post('/:eventId/apply', eventExists, applyToEventValidator, applyToEvent);
router.get('/:eventId/applications', eventExists, getApplications);
router.get('/:eventId/registration', eventExists, checkUserRegistration);
router.delete('/:eventId/apply', eventExists, cancelRegistrationValidator, cancelRegistration);
router.put('/applications/:applicationId', updateApplicationStatus);

// Delete route
router.delete('/:id', eventExists, isEventCreator, deleteEvent);

// Restore route
router.post('/:id/restore', eventExists, isEventCreator, restoreEvent);

export default router;
