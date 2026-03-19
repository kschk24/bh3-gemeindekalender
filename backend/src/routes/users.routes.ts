import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const usersController = new UsersController();

// All user routes require authentication
router.use(authenticate);

router.get('/me', usersController.getProfile);
router.patch('/me/avatar', usersController.updateAvatar);
router.get('/me/favorites', usersController.getFavorites);
router.post('/me/favorites/:eventId', usersController.addFavorite);
router.delete('/me/favorites/:eventId', usersController.removeFavorite);
router.get('/me/export', usersController.exportData);
router.delete('/me', usersController.deleteAccount);

export default router;
