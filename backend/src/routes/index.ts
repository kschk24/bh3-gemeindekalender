import { Router } from 'express';
import authRoutes from './auth.routes';
import eventsRoutes from './events.routes';
import categoriesRoutes from './categories.routes';
import usersRoutes from './users.routes';
import commentsRoutes from './comments.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/users', usersRoutes);
router.use('/', commentsRoutes);

export default router;
