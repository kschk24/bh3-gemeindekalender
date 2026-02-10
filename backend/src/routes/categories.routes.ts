import { Router } from 'express';
import { CategoriesController } from '../controllers/categories.controller';

const router = Router();
const categoriesController = new CategoriesController();

router.get('/', categoriesController.getAll);
router.get('/:id', categoriesController.getById);

export default router;
