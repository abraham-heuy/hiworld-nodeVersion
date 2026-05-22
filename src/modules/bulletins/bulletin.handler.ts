import { Request, Response, NextFunction } from 'express';
import { CreateBulletinCommentDto, UpdateBulletinCommentDto } from '../../dtos/bulletin-comment.dto';
import { CreateBulletinDto } from '../../dtos/other.dto';
import { BulletinService } from './bulletin.service';

export class BulletinController {
  constructor(private bulletinService: BulletinService) {}

  // Bulletins
  createBulletin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreateBulletinDto = req.body;
      const bulletin = await this.bulletinService.createBulletin(req.authenticatedUser!.id, dto);
      res.status(201).json(bulletin);
    } catch (error) { next(error); }
  };

  getAllBulletins = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const bulletins = await this.bulletinService.getAllBulletins(limit, offset);
      res.json(bulletins);
    } catch (error) { next(error); }
  };

  getBulletin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const bulletin = await this.bulletinService.getBulletinById(id);
      res.json(bulletin);
    } catch (error) { next(error); }
  };

  getUserBulletins = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const bulletins = await this.bulletinService.getBulletinsByUser(userId, limit, offset);
      res.json(bulletins);
    } catch (error) { next(error); }
  };

  getFriendsBulletins = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const bulletins = await this.bulletinService.getFriendsBulletins(req.authenticatedUser!.id, limit, offset);
      res.json(bulletins);
    } catch (error) { next(error); }
  };

  updateBulletin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dto: CreateBulletinDto = req.body;
      const updated = await this.bulletinService.updateBulletin(id, req.authenticatedUser!.id, dto);
      res.json(updated);
    } catch (error) { next(error); }
  };

  deleteBulletin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.bulletinService.deleteBulletin(id, req.authenticatedUser!.id);
      res.json({ message: 'Bulletin deleted' });
    } catch (error) { next(error); }
  };

  // Comments
  addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dto: CreateBulletinCommentDto = req.body;
      const comment = await this.bulletinService.addComment(id, req.authenticatedUser!.id, dto);
      res.status(201).json(comment);
    } catch (error) { next(error); }
  };

  getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const comments = await this.bulletinService.getComments(id, limit, offset);
      res.json(comments);
    } catch (error) { next(error); }
  };

  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId } = req.params;
      const dto: UpdateBulletinCommentDto = req.body;
      const comment = await this.bulletinService.updateComment(commentId, req.authenticatedUser!.id, dto);
      res.json(comment);
    } catch (error) { next(error); }
  };

  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId } = req.params;
      const isAdmin = req.authenticatedUser!.rank >= 10;
      await this.bulletinService.deleteComment(commentId, req.authenticatedUser!.id, isAdmin);
      res.json({ message: 'Comment deleted' });
    } catch (error) { next(error); }
  };
}