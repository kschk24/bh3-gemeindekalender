import { Router } from 'express';
import { CommentsController } from '../controllers/comments.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { createCommentSchema } from '../validators/comments.validators';

const router = Router();
const commentsController = new CommentsController();

// Get comments for an event (public)
router.get('/events/:eventId/comments', commentsController.getByEventId);

// Create a comment (optional auth - can be guest or authenticated user)
router.post('/events/:eventId/comments', optionalAuth, validateRequest(createCommentSchema), commentsController.create);

// Delete a comment (requires authentication - only own comment or admin)
router.delete('/comments/:id', authenticate, commentsController.delete);

export default router;
