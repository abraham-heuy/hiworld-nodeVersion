import { Request, Response, NextFunction } from 'express';
import { CreateBlogCommentDto, UpdateBlogCommentDto } from '../../dtos/blog-comment.dto';
import { CreateBlogDto, GetBlogsQueryDto, UpdateBlogDto } from '../../dtos/other.dto';
import { BlogService } from './blog.service';

export class BlogController {
  constructor(private blogService: BlogService) {}

  // Categories
  getCategories = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.blogService.getCategories();
      res.json(categories);
    } catch (error) { next(error); }
  };

  // Blogs
  createBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreateBlogDto = req.body;
      const blog = await this.blogService.createBlog(req.authenticatedUser!.id, dto);
      res.status(201).json(blog);
    } catch (error) { next(error); }
  };

  getBlogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: GetBlogsQueryDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        categoryId: req.query.categoryId as string,
        authorId: req.query.authorId as string,
        sort: req.query.sort as any,
      };
      const result = await this.blogService.getBlogs(req.authenticatedUser?.id, query);
      res.json(result);
    } catch (error) { next(error); }
  };

  getBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const blog = await this.blogService.getBlogById(id, req.authenticatedUser?.id);
      res.json(blog);
    } catch (error) { next(error); }
  };

  updateBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dto: UpdateBlogDto = req.body;
      const updated = await this.blogService.updateBlog(id, req.authenticatedUser!.id, dto);
      res.json(updated);
    } catch (error) { next(error); }
  };

  deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.blogService.deleteBlog(id, req.authenticatedUser!.id);
      res.json({ message: 'Blog deleted' });
    } catch (error) { next(error); }
  };

  giveKudos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.blogService.giveKudos(id, req.authenticatedUser!.id);
      res.json({ message: 'Kudos given' });
    } catch (error) { next(error); }
  };

  // Comments
  addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dto: CreateBlogCommentDto = req.body;
      const comment = await this.blogService.addComment(id, req.authenticatedUser!.id, dto);
      res.status(201).json(comment);
    } catch (error) { next(error); }
  };

  getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const comments = await this.blogService.getComments(id, limit, offset);
      res.json(comments);
    } catch (error) { next(error); }
  };

  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId } = req.params;
      const dto: UpdateBlogCommentDto = req.body;
      const comment = await this.blogService.updateComment(commentId, req.authenticatedUser!.id, dto);
      res.json(comment);
    } catch (error) { next(error); }
  };

  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId } = req.params;
      const isAdmin = req.authenticatedUser!.rank >= 10;
      await this.blogService.deleteComment(commentId, req.authenticatedUser!.id, isAdmin);
      res.json({ message: 'Comment deleted' });
    } catch (error) { next(error); }
  };
}