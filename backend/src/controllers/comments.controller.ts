import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { CommentsService } from '../services/comments.service';
import { AuthRequest } from '../middleware/auth';
import { CreateCommentInput } from '../validators/comments.validators';

const commentsService = new CommentsService();

export class CommentsController {
  getByEventId = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params;
      const comments = await commentsService.getByEventId(eventId);
      res.json(comments);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params;
      const data: CreateCommentInput = req.body;
      const userId = req.user?.id;
      const comment = await commentsService.create(eventId, userId, data);
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const isAdmin = req.user!.role === Role.ADMIN;
      await commentsService.delete(id, userId, isAdmin);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
