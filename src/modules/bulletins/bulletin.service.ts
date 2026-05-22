import { In, Repository } from 'typeorm';
import { CreateBulletinCommentDto, UpdateBulletinCommentDto } from '../../dtos/bulletin-comment.dto';
import { CreateBulletinDto } from '../../dtos/other.dto';
import { BulletinComment } from '../../entities/bulletin-comment.entity';
import { Bulletin } from '../../entities/bulletin.entity';
import { Friend } from '../../entities/friend.entity';
import { User } from '../../entities/user.entity';
import { NotFoundException, ForbiddenException } from '../../exceptions/HttpExceptions';

export class BulletinService {
  constructor(
    private bulletinRepo: Repository<Bulletin>,
    private bulletinCommentRepo: Repository<BulletinComment>,
    private userRepo: Repository<User>,
    private friendRepo: Repository<Friend>
  ) {}

  // ========== BULLETIN CRUD ==========
  async createBulletin(authorId: string, dto: CreateBulletinDto): Promise<Bulletin> {
    const bulletin = this.bulletinRepo.create({
      title: dto.title,
      text: dto.text,
      author: authorId,
      date: new Date(),
    });
    return this.bulletinRepo.save(bulletin);
  }

  async getAllBulletins(limit = 20, offset = 0): Promise<Bulletin[]> {
    return this.bulletinRepo.find({
      order: { date: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getBulletinById(id: string): Promise<Bulletin> {
    const bulletin = await this.bulletinRepo.findOne({ where: { id } });
    if (!bulletin) throw new NotFoundException('Bulletin not found');
    return bulletin;
  }

  async getBulletinsByUser(userId: string, limit = 20, offset = 0): Promise<Bulletin[]> {
    return this.bulletinRepo.find({
      where: { author: userId },
      order: { date: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getFriendsBulletins(viewerId: string, limit = 20, offset = 0): Promise<Bulletin[]> {
    // Get friend IDs
    const friendships = await this.friendRepo.find({
      where: [
        { sender: viewerId, status: 'ACCEPTED' },
        { receiver: viewerId, status: 'ACCEPTED' }
      ]
    });
    const friendUsernames: string[] = [];
    for (const f of friendships) {
      if (f.sender === viewerId) friendUsernames.push(f.receiver);
      else friendUsernames.push(f.sender);
    }
    const friendUsers = await this.userRepo.find({ where: { username: In(friendUsernames) } });
    const friendIds = friendUsers.map(u => u.id);

    return this.bulletinRepo.find({
      where: { author: In([viewerId, ...friendIds]) },
      order: { date: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async updateBulletin(id: string, userId: string, dto: CreateBulletinDto): Promise<Bulletin> {
    const bulletin = await this.bulletinRepo.findOne({ where: { id } });
    if (!bulletin) throw new NotFoundException('Bulletin not found');
    if (bulletin.author !== userId) throw new ForbiddenException('You can only edit your own bulletins');
    bulletin.title = dto.title;
    bulletin.text = dto.text;
    return this.bulletinRepo.save(bulletin);
  }

  async deleteBulletin(id: string, userId: string): Promise<void> {
    const bulletin = await this.bulletinRepo.findOne({ where: { id } });
    if (!bulletin) throw new NotFoundException('Bulletin not found');
    if (bulletin.author !== userId) throw new ForbiddenException('You can only delete your own bulletins');
    await this.bulletinRepo.remove(bulletin);
  }

  // ========== COMMENTS ==========
  async addComment(bulletinId: string, authorId: string, dto: CreateBulletinCommentDto): Promise<BulletinComment> {
    const bulletin = await this.bulletinRepo.findOne({ where: { id: bulletinId } });
    if (!bulletin) throw new NotFoundException('Bulletin not found');
    const comment = this.bulletinCommentRepo.create({
      bulletinId,
      author: authorId,
      text: dto.text,
      parentId: dto.parentId || null,
      date: new Date(),
    });
    return this.bulletinCommentRepo.save(comment);
  }

  async getComments(bulletinId: string, limit = 20, offset = 0): Promise<BulletinComment[]> {
    return this.bulletinCommentRepo.find({
      where: { bulletinId },
      order: { date: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async updateComment(commentId: string, userId: string, dto: UpdateBulletinCommentDto): Promise<BulletinComment> {
    const comment = await this.bulletinCommentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author !== userId) throw new ForbiddenException('You can only edit your own comments');
    comment.text = dto.text;
    return this.bulletinCommentRepo.save(comment);
  }

  async deleteComment(commentId: string, userId: string, isAdmin = false): Promise<void> {
    const comment = await this.bulletinCommentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author !== userId && !isAdmin) throw new ForbiddenException('Cannot delete this comment');
    await this.bulletinCommentRepo.remove(comment);
  }
}