import { Response, NextFunction } from 'express';
import { UsersService } from '../services/users.service';
import { GdprService } from '../services/gdpr.service';
import { AuthRequest } from '../middleware/auth';

const usersService = new UsersService();
const gdprService = new GdprService();

export class UsersController {
  getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const user = await usersService.getProfile(userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  getFavorites = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const favorites = await usersService.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      next(error);
    }
  };

  addFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { eventId } = req.params;
      const favorite = await usersService.addFavorite(userId, eventId);
      res.status(201).json(favorite);
    } catch (error) {
      next(error);
    }
  };

  removeFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { eventId } = req.params;
      await usersService.removeFavorite(userId, eventId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  exportData = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = await gdprService.exportUserData(userId);
      res.setHeader('Content-Disposition', 'attachment; filename="my-data.json"');
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      await gdprService.deleteAccount(userId);
      // Clear auth cookies since account is gone
      res.clearCookie('access_token');
      res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
