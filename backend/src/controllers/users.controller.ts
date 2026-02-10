import { Response, NextFunction } from 'express';
import { UsersService } from '../services/users.service';
import { AuthRequest } from '../middleware/auth';

const usersService = new UsersService();

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
}
