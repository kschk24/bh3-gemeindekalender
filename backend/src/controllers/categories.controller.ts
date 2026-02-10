import { Request, Response, NextFunction } from 'express';
import { CategoriesService } from '../services/categories.service';

const categoriesService = new CategoriesService();

export class CategoriesController {
  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await categoriesService.getAll();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const category = await categoriesService.getById(id);
      res.json(category);
    } catch (error) {
      next(error);
    }
  };
}
