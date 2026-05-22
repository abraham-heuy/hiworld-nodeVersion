import { Repository } from 'typeorm';
import { CreateForumTopicDto, GetTopicsQueryDto, UpdateForumTopicDto } from '../../../dtos/forum/forum-topic.dto';
import { ForumCategory } from '../../../entities/forums/forum-category.entity';
import { ForumModerator } from '../../../entities/forums/forum-moderator.entity';
import { ForumPost } from '../../../entities/forums/forum-post.entity';
import { ForumTopic } from '../../../entities/forums/forum-topic.entity';
import { BadRequestException, ForbiddenException, NotFoundException } from '../../../exceptions/HttpExceptions';

export class ForumTopicService {
  constructor(
    private topicRepo: Repository<ForumTopic>,
    private categoryRepo: Repository<ForumCategory>,
    private postRepo: Repository<ForumPost>,
    private moderatorRepo: Repository<ForumModerator>
  ) {}

  async createTopic(authorId: string, dto: CreateForumTopicDto): Promise<ForumTopic> {
    const category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
    if (!category) throw new BadRequestException('Invalid category');
    if (category.isLocked) throw new ForbiddenException('This category is locked');

    const topic = this.topicRepo.create({
      title: dto.title,
      slug: dto.slug,
      content: dto.content,
      authorId,
      categoryId: dto.categoryId,
    });
    const savedTopic = await this.topicRepo.save(topic);

    const firstPost = this.postRepo.create({
      content: dto.content,
      authorId,
      topicId: savedTopic.id,
      isFirstPost: true,
    });
    await this.postRepo.save(firstPost);
    return savedTopic;
  }

  async getTopicsByCategory(categoryId: string, query: GetTopicsQueryDto): Promise<{ topics: ForumTopic[]; total: number }> {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const [topics, total] = await this.topicRepo.findAndCount({
      where: { categoryId },
      order: { isPinned: 'DESC', createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { topics, total };
  }

  async getTopicById(topicId: string): Promise<ForumTopic> {
    const topic = await this.topicRepo.findOne({
      where: { id: topicId },
      relations: ['author', 'category'],
    });
    if (!topic) throw new NotFoundException('Topic not found');
    topic.viewCount += 1;
    await this.topicRepo.save(topic);
    return topic;
  }

  async updateTopic(topicId: string, userId: string, dto: UpdateForumTopicDto, isAdmin: boolean): Promise<ForumTopic> {
    const topic = await this.topicRepo.findOneBy({ id: topicId });
    if (!topic) throw new NotFoundException('Topic not found');
    const isModerator = await this.checkModerator(userId, topic.categoryId);
    if (topic.authorId !== userId && !isModerator && !isAdmin) {
      throw new ForbiddenException('You cannot edit this topic');
    }
    Object.assign(topic, dto);
    return this.topicRepo.save(topic);
  }

  async deleteTopic(topicId: string, userId: string, isAdmin: boolean): Promise<void> {
    const topic = await this.topicRepo.findOneBy({ id: topicId });
    if (!topic) throw new NotFoundException('Topic not found');
    const isModerator = await this.checkModerator(userId, topic.categoryId);
    if (topic.authorId !== userId && !isModerator && !isAdmin) {
      throw new ForbiddenException('You cannot delete this topic');
    }
    await this.topicRepo.remove(topic);
  }

  private async checkModerator(userId: string, categoryId: string): Promise<boolean> {
    const mod = await this.moderatorRepo.findOneBy({ userId, categoryId });
    return !!mod;
  }
}