import { Router } from 'express';
import { AppDataSource } from '../../database/data-source';
import { protect } from '../../middleware/auth.middleware';
import { BulletinController } from './bulletin.handler';
import { BulletinService } from './bulletin.service';

const router = Router();

const bulletinService = new BulletinService(
  AppDataSource.getRepository('Bulletin'),
  AppDataSource.getRepository('BulletinComment'),
  AppDataSource.getRepository('User'),
  AppDataSource.getRepository('Friend')
);
const bulletinController = new BulletinController(bulletinService);

// Public routes
router.get('/', bulletinController.getAllBulletins);
router.get('/:id', bulletinController.getBulletin);
router.get('/user/:userId', bulletinController.getUserBulletins);

// Protected routes
router.post('/', protect, bulletinController.createBulletin);
router.put('/:id', protect, bulletinController.updateBulletin);
router.delete('/:id', protect, bulletinController.deleteBulletin);
router.get('/friends/feed', protect, bulletinController.getFriendsBulletins);

// Comments
router.post('/:id/comments', protect, bulletinController.addComment);
router.get('/:id/comments', bulletinController.getComments);
router.put('/comments/:commentId', protect, bulletinController.updateComment);
router.delete('/comments/:commentId', protect, bulletinController.deleteComment);

export default router;