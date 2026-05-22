import { Request, Response, NextFunction } from 'express';
import { AddModeratorDto } from '../../../../dtos/forum/forum.moderator';
import { ForumModeratorService } from '../../services/forum-moderator.service';

export class ForumModeratorController {
  constructor(private moderatorService: ForumModeratorService) {}

  addModerator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params;
      const dto: AddModeratorDto = req.body;
      const moderator = await this.moderatorService.addModerator(categoryId, dto);
      res.status(201).json(moderator);
    } catch (error) {
      next(error);
    }
  };

  removeModerator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId, userId } = req.params;
      await this.moderatorService.removeModerator(categoryId, userId);
      res.json({ message: 'Moderator removed successfully' });
    } catch (error) {
      next(error);
    }
  };

  getModeratorsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params;
      const moderators = await this.moderatorService.getModeratorsByCategory(categoryId);
      res.json(moderators);
    } catch (error) {
      next(error);
    }
  };
}