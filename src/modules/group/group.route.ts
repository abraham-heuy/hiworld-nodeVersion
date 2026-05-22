import { Router } from 'express';
import { AppDataSource } from '../../database/data-source';
import { protect, requireRank } from '../../middleware/auth.middleware';
import { GroupController } from './group.handler';
import { GroupService } from './group.service';

const router = Router();

const groupService = new GroupService(
  AppDataSource.getRepository('Group'),
  AppDataSource.getRepository('GroupComment'),
  AppDataSource.getRepository('User')
);
const groupController = new GroupController(groupService);

// Public routes (view groups)
router.get('/', groupController.getGroups);
router.get('/:id', groupController.getGroup);
router.get('/:id/members', groupController.getMembers);
router.get('/:id/comments', groupController.getComments);

// Protected routes (require login)
router.post('/', protect, groupController.createGroup);
router.patch('/:id', protect, groupController.updateGroup);
router.delete('/:id', protect, groupController.deleteGroup);
router.post('/:id/join', protect, groupController.joinGroup);
router.post('/:id/leave', protect, groupController.leaveGroup);
router.delete('/:id/members/:userId', protect, groupController.removeMember);
router.post('/:id/report', protect, groupController.reportGroup);

// Comments
router.post('/:id/comments', protect, groupController.addComment);
router.patch('/comments/:commentId', protect, groupController.updateComment);
router.delete('/comments/:commentId', protect, groupController.deleteComment);

// Admin only
router.post('/:id/ban', protect, requireRank(10), groupController.banGroup);

export default router;