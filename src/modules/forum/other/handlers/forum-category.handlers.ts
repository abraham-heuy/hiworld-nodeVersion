import { Request, Response, NextFunction } from 'express';
import { CreateForumCategoryDto, UpdateForumCategoryDto } from '../../../../dtos/forum/forum-category.dto';
import { ForumCategoryService } from '../../services/forum-category.service';

export class ForumCategoryController {
  constructor(private categoryService: ForumCategoryService) {}

  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreateForumCategoryDto = req.body;
      const category = await this.categoryService.createCategory(dto);
      res.status(201).json(category);
    } catch (error) { next(error); }
  };

  getCategories = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoryService.getCategories();
      res.json(categories);
    } catch (error) { next(error); }
  };

  getCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getCategoryById(id);
      res.json(category);
    } catch (error) { next(error); }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dto: UpdateForumCategoryDto = req.body;
      const category = await this.categoryService.updateCategory(id, dto);
      res.json(category);
    } catch (error) { next(error); }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.categoryService.deleteCategory(id);
      res.json({ message: 'Category deleted' });
    } catch (error) { next(error); }
  };
}