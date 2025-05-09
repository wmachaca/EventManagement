import { Router } from 'express';
import {
  createEvent,
  listMyEvents,
  listAllEvents,
  listEvents,
  getEvent,
  updateEvent,
  applyToEvent,
  getApplications,
  updateApplicationStatus,
  deleteEvent,
  restoreEvent,
  getDeletedEvents,
} from '../controllers/events/index';
import { authMiddleware } from '../middleware/authMiddleware';
import { isEventCreator, eventValidationRules, validate } from '../middleware/eventAccess';
const router = Router();

// Applies to all routes below
router.use(authMiddleware);

// Event CRUD
router.post('/', eventValidationRules, validate, createEvent);
//router.get('/', listEvents);
router.get('/my', listMyEvents);
router.get('/all', listAllEvents);
router.get('/trash', getDeletedEvents);
router.get('/:id', getEvent);
router.put('/:id', isEventCreator, eventValidationRules, validate, updateEvent);

// Event applications
router.post('/:eventId/apply', applyToEvent);
router.get('/:eventId/applications', getApplications);
router.put('/applications/:applicationId', updateApplicationStatus);
// Delete route
router.delete('/:id', isEventCreator, deleteEvent);

// Restore route
router.post('/:id/restore', restoreEvent);

export default router;
