import { Router } from 'express';
import {createEvent, listEvents, getEvent, updateEvent, applyToEvent,getApplications, updateApplicationStatus} from '../controllers/events/index';
import { authMiddleware } from '../middleware/authMiddleware';
import { isEventCreator, eventValidationRules, validate } from '../middleware/eventAccess';
const router = Router();

// Applies to all routes below
router.use(authMiddleware); 

// Event CRUD
router.post('/', eventValidationRules, validate, createEvent);
router.get('/', listEvents);
router.get('/:id', getEvent);
router.put('/:id', isEventCreator, eventValidationRules, validate, updateEvent);

// Event applications
router.post('/:eventId/apply', applyToEvent);
router.get('/:eventId/applications', getApplications);
router.put('/applications/:applicationId', updateApplicationStatus);

export default router;