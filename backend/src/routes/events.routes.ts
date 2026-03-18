import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';
import { authenticate, requireAdmin, requireEventManager, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { createEventSchema, updateEventSchema, eventFiltersSchema, registrationSchema } from '../validators/events.validators';

const router = Router();
const eventsController = new EventsController();

// Public routes
router.get('/', validateRequest(eventFiltersSchema, 'query'), eventsController.getAll);
router.get('/mine', authenticate, requireEventManager, eventsController.getMine);
router.get('/:id', eventsController.getById);

// Protected routes (Admin or EventManager)
router.post('/', authenticate, requireEventManager, validateRequest(createEventSchema), eventsController.create);
router.put('/:id', authenticate, requireEventManager, validateRequest(updateEventSchema), eventsController.update);
router.delete('/:id', authenticate, requireEventManager, eventsController.delete);

// Event registrations
router.post('/:id/register', optionalAuth, validateRequest(registrationSchema), eventsController.register);
router.get('/:id/registrations', authenticate, requireAdmin, eventsController.getRegistrations);

export default router;
