import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AdminService } from '../services/admin.service';
import { AuthRequest } from '../middleware/auth';

const adminService = new AdminService();

export class AdminController {
  listUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await adminService.listUsers(page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  changeUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { role } = req.body as { role: Role };
      const user = await adminService.changeUserRole(id, role, req.user!.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await adminService.deleteUser(id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  listEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await adminService.listEvents(page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await adminService.deleteEvent(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
