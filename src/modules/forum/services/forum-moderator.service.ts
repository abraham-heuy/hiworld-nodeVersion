import { Repository } from 'typeorm';
import { AddModeratorDto } from '../../../dtos/forum/forum.moderator';
import { ForumCategory } from '../../../entities/forums/forum-category.entity';
import { ForumModerator } from '../../../entities/forums/forum-moderator.entity';
import { User } from '../../../entities/user.entity';
import { NotFoundException, ConflictException } from '../../../exceptions/HttpExceptions';

export class ForumModeratorService {
  constructor(
    private moderatorRepo: Repository<ForumModerator>,
    private userRepo: Repository<User>,
    private categoryRepo: Repository<ForumCategory>
  ) {}

  async addModerator(categoryId: string, dto: AddModeratorDto): Promise<ForumModerator> {
    const user = await this.userRepo.findOneBy({ id: dto.userId });
    if (!user) throw new NotFoundException('User not found');
    const category = await this.categoryRepo.findOneBy({ id: categoryId });
    if (!category) throw new NotFoundException('Category not found');

    const existing = await this.moderatorRepo.findOneBy({ userId: dto.userId, categoryId });
    if (existing) throw new ConflictException('User is already a moderator');

    const moderator = this.moderatorRepo.create({
      userId: dto.userId,
      categoryId,
    });
    return this.moderatorRepo.save(moderator);
  }

  async removeModerator(categoryId: string, userId: string): Promise<void> {
    const result = await this.moderatorRepo.delete({ userId, categoryId });
    if (result.affected === 0) throw new NotFoundException('Moderator not found');
  }

  async getModeratorsByCategory(categoryId: string): Promise<ForumModerator[]> {
    return this.moderatorRepo.find({
      where: { categoryId },
      relations: ['user'],
    });
  }
}