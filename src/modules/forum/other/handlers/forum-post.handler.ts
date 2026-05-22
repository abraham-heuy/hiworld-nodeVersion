import { Request, Response, NextFunction } from 'express';
import { CreateForumPostDto, UpdateForumPostDto } from '../../../../dtos/forum/forum-post.dto';
import { HttpException } from '../../../../exceptions/HttpExceptions';
import { ForumPostService } from '../../services/forum-post.service';

export class ForumPostController {
  constructor(private postService: ForumPostService) {}

  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { topicId } = req.params;
      const dto: CreateForumPostDto = req.body;
      const userId = req.authenticatedUser!.id;
      const post = await this.postService.createPost(topicId, userId, dto);
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  };

  getPostsByTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { topicId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const result = await this.postService.getPostsByTopic(topicId, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const post = await this.postService.getPostById(id);
      res.json(post);
    } catch (error) {
      next(error);
    }
  };

  updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dto: UpdateForumPostDto = req.body;
      const userId = req.authenticatedUser!.id;
      const isAdmin = (req.authenticatedUser?.rank ?? 0) >= 10;
      const post = await this.postService.updatePost(id, userId, dto, isAdmin);
      res.json(post);
    } catch (error) {
      next(error);
    }
  };

  deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.authenticatedUser!.id;
      const isAdmin = (req.authenticatedUser?.rank ?? 0) >= 10;
      await this.postService.deletePost(id, userId, isAdmin);
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  votePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { value } = req.body;
      if (typeof value !== 'number' || (value !== 1 && value !== -1)) {
        throw new HttpException(400, 'Vote value must be 1 or -1');
      }
      const userId = req.authenticatedUser!.id;
      const post = await this.postService.votePost(id, userId, value);
      res.json(post);
    } catch (error) {
      next(error);
    }
  };
}