import { Repository } from 'typeorm';
import { CreateForumPostDto, UpdateForumPostDto } from '../../../dtos/forum/forum-post.dto';
import { ForumModerator } from '../../../entities/forums/forum-moderator.entity';
import { ForumPost } from '../../../entities/forums/forum-post.entity';
import { ForumTopic } from '../../../entities/forums/forum-topic.entity';
import { NotFoundException, ForbiddenException } from '../../../exceptions/HttpExceptions';

export class ForumPostService {
  constructor(
    private postRepo: Repository<ForumPost>,
    private topicRepo: Repository<ForumTopic>,
    private moderatorRepo: Repository<ForumModerator>  ) {}

  async createPost(topicId: string, authorId: string, dto: CreateForumPostDto): Promise<ForumPost> {
    const topic = await this.topicRepo.findOneBy({ id: topicId });
    if (!topic) throw new NotFoundException('Topic not found');
    if (topic.isLocked) throw new ForbiddenException('This topic is locked');

    const post = this.postRepo.create({
      content: dto.content,
      authorId,
      topicId,
      isFirstPost: false,
    });
    return this.postRepo.save(post);
  }

  async getPostsByTopic(topicId: string, page = 1, limit = 20): Promise<{ posts: ForumPost[]; total: number }> {
    const skip = (page - 1) * limit;
    const [posts, total] = await this.postRepo.findAndCount({
      where: { topicId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    });
    return { posts, total };
  }

  async getPostById(postId: string): Promise<ForumPost> {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['author', 'topic'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async updatePost(postId: string, userId: string, dto: UpdateForumPostDto, isAdmin: boolean): Promise<ForumPost> {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['topic'],
    });
    if (!post) throw new NotFoundException('Post not found');
    const isModerator = await this.checkModerator(userId, post.topic.categoryId);
    if (post.authorId !== userId && !isModerator && !isAdmin) {
      throw new ForbiddenException('You cannot edit this post');
    }
    post.content = dto.content;
    return this.postRepo.save(post);
  }

  async deletePost(postId: string, userId: string, isAdmin: boolean): Promise<void> {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['topic'],
    });
    if (!post) throw new NotFoundException('Post not found');
    const isModerator = await this.checkModerator(userId, post.topic.categoryId);
    if (post.authorId !== userId && !isModerator && !isAdmin) {
      throw new ForbiddenException('You cannot delete this post');
    }
    await this.postRepo.remove(post);
  }

  async votePost(postId: string, _userId: string, value: number): Promise<ForumPost> {
    const post = await this.postRepo.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');
    post.votes += value;
    return this.postRepo.save(post);
  }

  private async checkModerator(userId: string, categoryId: string): Promise<boolean> {
    const mod = await this.moderatorRepo.findOneBy({ userId, categoryId });
    return !!mod;
  }
}