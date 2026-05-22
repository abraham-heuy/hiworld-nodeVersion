import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import path from 'path';
import { Friend } from '../../entities/friend.entity';
import { User } from '../../entities/user.entity';
import { ProfileResponseDto } from '../../dtos/profile.dto';
import { UpdateProfileDto } from '../../dtos/user.dto';
import { NotFoundException, ForbiddenException, BadRequestException } from '../../exceptions/HttpExceptions';

export class ProfileService {
  constructor(
    private userRepo: Repository<User>,
    private friendRepo: Repository<Friend>
  ) {}

  async getProfile(userId: string, viewerId?: string): Promise<ProfileResponseDto> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Privacy check: if profile is private and viewer is not the owner and not a friend, deny access
    if (user.private && viewerId !== userId) {
      // Check if viewer is a friend
      let isFriend = false;
      if (viewerId) {
        const friendship = await this.friendRepo.findOne({
          where: [
            { sender: viewerId, receiver: user.username, status: 'ACCEPTED' },
            { sender: user.username, receiver: viewerId, status: 'ACCEPTED' }
          ]
        });
        isFriend = !!friendship;
      }
      if (!isFriend && viewerId !== userId) {
        throw new ForbiddenException('This profile is private');
      }
    }

    // Increment view count (only if viewer is not the owner)
    if (viewerId !== userId) {
      user.views += 1;
      await this.userRepo.save(user);
    }

    const interests = typeof user.interests === 'string' ? JSON.parse(user.interests || '{}') : (user.interests || {});
    const response: ProfileResponseDto = {
      id: user.id,
      username: user.username,
      bio: user.bio,
      interests,
      music: user.music,
      pfp: user.pfp,
      status: user.status,
      private: user.private,
      views: user.views,
      date: user.date,
      lastactive: user.lastactive,
    };
    // Only include CSS if viewer is the owner
    if (viewerId === userId && user.css) {
      response.css = user.css.toString();
    }
    return response;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.interests !== undefined) user.interests = JSON.stringify(dto.interests);
    if (dto.music !== undefined) user.music = dto.music;
    if (dto.pfp !== undefined) user.pfp = dto.pfp;
    if (dto.css !== undefined) user.css = Buffer.from(dto.css);
    if (dto.status !== undefined) user.status = dto.status;
    if (dto.private !== undefined) user.private = dto.private;

    user.lastactive = new Date();
    await this.userRepo.save(user);
    return user;
  }

  async uploadFile(userId: string, file: Express.Multer.File, type: 'pfp' | 'music'): Promise<string> {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedMusicTypes = ['audio/mpeg', 'audio/ogg', 'audio/wav'];
    const maxSize = type === 'pfp' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;

    if (file.size > maxSize) throw new BadRequestException('File too large');
    if (type === 'pfp' && !allowedImageTypes.includes(file.mimetype)) throw new BadRequestException('Invalid image type');
    if (type === 'music' && !allowedMusicTypes.includes(file.mimetype)) throw new BadRequestException('Invalid music type');

    const ext = path.extname(file.originalname);
    const filename = `${userId}_${Date.now()}${ext}`;
    const uploadDir = path.join(__dirname, '../../uploads', type === 'pfp' ? 'pfp' : 'music');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), file.buffer);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (type === 'pfp') user.pfp = filename;
    else user.music = filename;
    await this.userRepo.save(user);

    return filename;
  }

  // ==================== FRIENDS ====================
  async getFriends(userId: string): Promise<User[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const friendships = await this.friendRepo.find({
      where: [
        { sender: userId, status: 'ACCEPTED' },
        { receiver: user.username, status: 'ACCEPTED' }
      ]
    });

    const friendIds: string[] = [];
    for (const f of friendships) {
      if (f.sender === userId) {
        // find user by username (receiver)
        const friendUser = await this.userRepo.findOne({ where: { username: f.receiver } });
        if (friendUser) friendIds.push(friendUser.id);
      } else {
        // sender is friend's username, find user by id? Actually sender is username string, not id. So we need to find by username.
        const friendUser = await this.userRepo.findOne({ where: { username: f.sender } });
        if (friendUser) friendIds.push(friendUser.id);
      }
    }

    // Remove duplicates and fetch full user objects
    const uniqueIds = [...new Set(friendIds)];
    const friends = await this.userRepo.findByIds(uniqueIds);
    return friends;
  }

  async getTop8Friends(userId: string): Promise<User[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Get accepted friendships, order by friend request ID descending (most recent first)
    const friendships = await this.friendRepo.find({
      where: [
        { sender: userId, status: 'ACCEPTED' },
        { receiver: user.username, status: 'ACCEPTED' }
      ],
      order: { id: 'DESC' }, // assumes `id` is auto-increment, most recent first
      take: 8
    });

    const friendUsers: User[] = [];
    for (const f of friendships) {
      let friendUsername: string;
      if (f.sender === userId) {
        friendUsername = f.receiver;
      } else {
        friendUsername = f.sender;
      }
      const friendUser = await this.userRepo.findOne({ where: { username: friendUsername } });
      if (friendUser) friendUsers.push(friendUser);
    }
    return friendUsers;
  }

  // ==================== SEARCH ====================
  async searchUsersByUsername(query: string, limit: number = 20): Promise<Partial<User>[]> {
    if (!query || query.length < 2) throw new BadRequestException('Search query must be at least 2 characters');

    const users = await this.userRepo
      .createQueryBuilder('user')
      .where('user.username LIKE :query', { query: `%${query}%` })
      .andWhere('user.is_active = :active', { active: true })
      .select(['user.id', 'user.username', 'user.pfp', 'user.status', 'user.private']) // only necessary fields
      .take(limit)
      .getMany();

    // Optionally filter out private profiles for non-friends? That's more complex; return basic info.
    return users;
  }
}