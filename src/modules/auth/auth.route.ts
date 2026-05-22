import { Router } from 'express';
import { AuthService } from './auth.service';
import { AppDataSource } from '../../database/data-source';
import { AuthController } from './auth.handler';
import { protect, requireRank } from '../../middleware/auth.middleware';

const router = Router();

// Initialize service and controller with dependencies
const authService = new AuthService(
  AppDataSource.getRepository('User'),
  AppDataSource.getRepository('Invite'),
  AppDataSource.getRepository('Admin'),
  AppDataSource.getRepository('Session')
);
const authController = new AuthController(authService);

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/admin/login', authController.adminLogin);
router.post('/refresh', authController.refresh);

// Protected routes (require login)
router.post('/logout', protect, authController.logout);

// Admin only routes (rank >= 10)
router.get('/admin/waitlist', protect, requireRank(10), authController.getWaitlist);
router.post('/admin/approve/:userId', protect, requireRank(10), authController.approveWaitlistUser);
router.post('/admin/invites', protect, requireRank(10), authController.generateInvites);

export default router;