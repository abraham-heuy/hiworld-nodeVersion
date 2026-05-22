import { Request, Response, NextFunction } from 'express';
import { CreateLayoutCommentDto, UpdateLayoutCommentDto } from '../../dtos/layout-comment.dto';
import { CreateLayoutDto, UpdateLayoutDto } from '../../dtos/layout.dto';
import { LayoutService } from './layout.service';

export class LayoutController {
  constructor(private layoutService: LayoutService) {}

  // Layouts
  createLayout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreateLayoutDto = req.body;
      const layout = await this.layoutService.createLayout(req.authenticatedUser!.id, dto);
      res.status(201).json(layout);
    } catch (error) { next(error); }
  };

  getAllLayouts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const layouts = await this.layoutService.getAllLayouts(limit, offset);
      res.json(layouts);
    } catch (error) { next(error); }
  };

  getLayout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const layout = await this.layoutService.getLayoutById(id);
      res.json(layout);
    } catch (error) { next(error); }
  };

  getUserLayouts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const layouts = await this.layoutService.getLayoutsByUser(userId, limit, offset);
      res.json(layouts);
    } catch (error) { next(error); }
  };

  updateLayout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dto: UpdateLayoutDto = req.body;
      const updated = await this.layoutService.updateLayout(id, req.authenticatedUser!.id, dto);
      res.json(updated);
    } catch (error) { next(error); }
  };

  deleteLayout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const isAdmin = (req.authenticatedUser?.rank ?? 0) >= 10;
      await this.layoutService.deleteLayout(id, req.authenticatedUser!.id, isAdmin);
      res.json({ message: 'Layout deleted' });
    } catch (error) { next(error); }
  };

  // Comments
  addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dto: CreateLayoutCommentDto = req.body;
      const comment = await this.layoutService.addComment(id, req.authenticatedUser!.id, dto);
      res.status(201).json(comment);
    } catch (error) { next(error); }
  };

  getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const comments = await this.layoutService.getComments(id, limit, offset);
      res.json(comments);
    } catch (error) { next(error); }
  };

  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId } = req.params;
      const dto: UpdateLayoutCommentDto = req.body;
      const comment = await this.layoutService.updateComment(commentId, req.authenticatedUser!.id, dto);
      res.json(comment);
    } catch (error) { next(error); }
  };

  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId } = req.params;
      const isAdmin = (req.authenticatedUser?.rank ?? 0) >= 10;
      await this.layoutService.deleteComment(commentId, req.authenticatedUser!.id, isAdmin);
      res.json({ message: 'Comment deleted' });
    } catch (error) { next(error); }
  };
}