import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { createEventSchema, updateEventSchema, eventFiltersSchema, registrationSchema } from '../validators/events.validators';

const router = Router();
const eventsController = new EventsController();

// Public routes
router.get('/', validateRequest(eventFiltersSchema, 'query'), eventsController.getAll);
router.get('/:id', eventsController.getById);

// Protected routes (Admin only)
router.post('/', authenticate, requireAdmin, validateRequest(createEventSchema), eventsController.create);
router.put('/:id', authenticate, requireAdmin, validateRequest(updateEventSchema), eventsController.update);
router.delete('/:id', authenticate, requireAdmin, eventsController.delete);

// Event registrations
router.post('/:id/register', optionalAuth, validateRequest(registrationSchema), eventsController.register);
router.get('/:id/registrations', authenticate, requireAdmin, eventsController.getRegistrations);

export default router;
