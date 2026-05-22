import { Router } from 'express';
import { AppDataSource } from '../../database/data-source';
import { Layout } from '../../entities/invite.entity';
import { LayoutComment } from '../../entities/layout-comment.entity';
import { protect } from '../../middleware/auth.middleware';
import { LayoutController } from './layout.handler';
import { LayoutService } from './layout.service';

const router = Router();

const layoutRepo = AppDataSource.getRepository(Layout);
const commentRepo = AppDataSource.getRepository(LayoutComment);

const layoutService = new LayoutService(layoutRepo, commentRepo);
const layoutController = new LayoutController(layoutService);

// Public routes
router.get('/', layoutController.getAllLayouts);
router.get('/:id', layoutController.getLayout);
router.get('/user/:userId', layoutController.getUserLayouts);
router.get('/:id/comments', layoutController.getComments);

// Protected routes (require login)
router.post('/', protect, layoutController.createLayout);
router.put('/:id', protect, layoutController.updateLayout);
router.delete('/:id', protect, layoutController.deleteLayout);
router.post('/:id/comments', protect, layoutController.addComment);
router.put('/comments/:commentId', protect, layoutController.updateComment);
router.delete('/comments/:commentId', protect, layoutController.deleteComment);

export default router;