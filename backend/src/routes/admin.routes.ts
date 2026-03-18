import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const adminController = new AdminController();

// All admin routes require authentication + ADMIN role
router.use(authenticate, requireAdmin);

router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', adminController.changeUserRole);
router.delete('/users/:id', adminController.deleteUser);

router.get('/events', adminController.listEvents);
router.delete('/events/:id', adminController.deleteEvent);

export default router;
