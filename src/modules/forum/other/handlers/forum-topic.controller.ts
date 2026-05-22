import { Request, Response, NextFunction } from 'express';
import { CreateForumTopicDto, GetTopicsQueryDto, UpdateForumTopicDto } from '../../../../dtos/forum/forum-topic.dto';
import { ForumTopicService } from '../../services/forum-topic.service';

export class ForumTopicController {
  constructor(private topicService: ForumTopicService) {}

  createTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreateForumTopicDto = req.body;
      // authenticatedUser is guaranteed by `protect` middleware, but TypeScript doesn't know
      const userId = req.authenticatedUser!.id;
      const topic = await this.topicService.createTopic(userId, dto);
      res.status(201).json(topic);
    } catch (error) {
      next(error);
    }
  };

  getTopicsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params;
      const query: GetTopicsQueryDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };
      const result = await this.topicService.getTopicsByCategory(categoryId, query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const topic = await this.topicService.getTopicById(id);
      res.json(topic);
    } catch (error) {
      next(error);
    }
  };

  updateTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dto: UpdateForumTopicDto = req.body;
      const userId = req.authenticatedUser!.id;
      const isAdmin = (req.authenticatedUser?.rank ?? 0) >= 10;
      const topic = await this.topicService.updateTopic(id, userId, dto, isAdmin);
      res.json(topic);
    } catch (error) {
      next(error);
    }
  };

  deleteTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.authenticatedUser!.id;
      const isAdmin = (req.authenticatedUser?.rank ?? 0) >= 10;
      await this.topicService.deleteTopic(id, userId, isAdmin);
      res.json({ message: 'Topic deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}