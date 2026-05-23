import { Router } from 'express';
import multer from 'multer';
import { AppDataSource } from '../../database/data-source';
import { protect } from '../../middleware/auth.middleware';
import { ProfileController } from './user.handler';
import { ProfileService } from './user.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const profileService = new ProfileService(
  AppDataSource.getRepository('User'),
  AppDataSource.getRepository('Friend')
);
const profileController = new ProfileController(profileService);

// Public routes (anyone can view, but privacy applied inside service)
router.get('/', profileController.getUsers);

router.get('/:userId', profileController.getProfile);
router.get('/search', profileController.searchUsers);
router.get('/:userId/friends', profileController.getFriends);
router.get('/:userId/top8', profileController.getTop8Friends);

// Protected routes (only logged-in users can edit their own profile)
router.patch('/', protect, profileController.updateProfile);
router.post('/upload-pfp', protect, upload.single('pfp'), profileController.uploadPfp);
router.post('/upload-music', protect, upload.single('music'), profileController.uploadMusic);

// Own friends/top8 (no userId param, uses authenticated user)
router.get('/me/friends', protect, (req, res, next) => {
  req.params.userId = req.authenticatedUser!.id;
  profileController.getFriends(req, res, next);
});
router.get('/me/top8', protect, (req, res, next) => {
  req.params.userId = req.authenticatedUser!.id;
  profileController.getTop8Friends(req, res, next);
});

export default router;