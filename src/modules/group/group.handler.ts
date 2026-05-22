import { Request, Response, NextFunction } from 'express';
import { CreateGroupCommentDto, CreateGroupDto, UpdateGroupCommentDto, UpdateGroupDto } from '../../dtos/group-comment.dto';
import { ReportGroupDto } from '../../dtos/group.dto';
import { GroupService } from './group.service';

export class GroupController {
  constructor(private groupService: GroupService) {}

  createGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreateGroupDto = req.body;
      const group = await this.groupService.createGroup(req.authenticatedUser!.id, dto);
      res.status(201).json(group);
    } catch (error) { next(error); }
  };

  getGroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const groups = await this.groupService.getGroups(limit, offset);
      res.json(groups);
    } catch (error) { next(error); }
  };

  getGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const group = await this.groupService.getGroupById(id);
      res.json(group);
    } catch (error) { next(error); }
  };

  updateGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dto: UpdateGroupDto = req.body;
      const updated = await this.groupService.updateGroup(id, req.authenticatedUser!.id, dto);
      res.json(updated);
    } catch (error) { next(error); }
  };

  deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.groupService.deleteGroup(id, req.authenticatedUser!.id);
      res.json({ message: 'Group deleted' });
    } catch (error) { next(error); }
  };

  joinGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const group = await this.groupService.joinGroup(id, req.authenticatedUser!.id);
      res.json({ message: 'Joined group', group });
    } catch (error) { next(error); }
  };

  leaveGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const group = await this.groupService.leaveGroup(id, req.authenticatedUser!.id);
      res.json({ message: 'Left group', group });
    } catch (error) { next(error); }
  };

  removeMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, userId } = req.params;
      const group = await this.groupService.removeMember(id, req.authenticatedUser!.id, userId);
      res.json({ message: 'Member removed', group });
    } catch (error) { next(error); }
  };

  getMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const members = await this.groupService.getGroupMembers(id);
      res.json(members);
    } catch (error) { next(error); }
  };

  reportGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dto: ReportGroupDto = req.body;
      const result = await this.groupService.reportGroup(id, req.authenticatedUser!.id, dto);
      res.json(result);
    } catch (error) { next(error); }
  };

  banGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.groupService.banGroup(id, req.authenticatedUser!.id);
      res.json({ message: 'Group banned' });
    } catch (error) { next(error); }
  };

  // Comments
  addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dto: CreateGroupCommentDto = { ...req.body, groupId: id };
      const comment = await this.groupService.addGroupComment(id, req.authenticatedUser!.id, dto);
      res.status(201).json(comment);
    } catch (error) { next(error); }
  };

  getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const comments = await this.groupService.getGroupComments(id, limit, offset);
      res.json(comments);
    } catch (error) { next(error); }
  };

  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId } = req.params;
      const dto: UpdateGroupCommentDto = req.body;
      const comment = await this.groupService.updateGroupComment(commentId, req.authenticatedUser!.id, dto);
      res.json(comment);
    } catch (error) { next(error); }
  };

  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId } = req.params;
      const isAdmin = req.authenticatedUser!.rank >= 10;
      await this.groupService.deleteGroupComment(commentId, req.authenticatedUser!.id, isAdmin);
      res.json({ message: 'Comment deleted' });
    } catch (error) { next(error); }
  };
}