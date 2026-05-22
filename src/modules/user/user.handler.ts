import { Request, Response, NextFunction } from 'express';
import { UpdateProfileDto } from '../../dtos/user.dto';
import { BadRequestException } from '../../exceptions/HttpExceptions';
import { ProfileService } from './user.service';

export class ProfileController {
  constructor(private profileService: ProfileService) {}

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId;
      const viewerId = req.authenticatedUser?.id;
      const profile = await this.profileService.getProfile(userId, viewerId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.authenticatedUser!.id;
      const dto: UpdateProfileDto = req.body;
      const updated = await this.profileService.updateProfile(userId, dto);
      res.json({ message: 'Profile updated', user: updated });
    } catch (error) {
      next(error);
    }
  };

  uploadPfp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) throw new BadRequestException('No file uploaded');
      const userId = req.authenticatedUser!.id;
      const filename = await this.profileService.uploadFile(userId, req.file, 'pfp');
      res.json({ message: 'Profile picture updated', filename });
    } catch (error) {
      next(error);
    }
  };

  uploadMusic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) throw new BadRequestException('No file uploaded');
      const userId = req.authenticatedUser!.id;
      const filename = await this.profileService.uploadFile(userId, req.file, 'music');
      res.json({ message: 'Music updated', filename });
    } catch (error) {
      next(error);
    }
  };

  getFriends = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId || req.authenticatedUser?.id;
      if (!userId) throw new BadRequestException('User ID required');
      const friends = await this.profileService.getFriends(userId);
      res.json(friends);
    } catch (error) {
      next(error);
    }
  };

  getTop8Friends = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId || req.authenticatedUser?.id;
      if (!userId) throw new BadRequestException('User ID required');
      const top8 = await this.profileService.getTop8Friends(userId);
      res.json(top8);
    } catch (error) {
      next(error);
    }
  };

  searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') throw new BadRequestException('Query parameter "q" required');
      const results = await this.profileService.searchUsersByUsername(q);
      res.json(results);
    } catch (error) {
      next(error);
    }
  };
}