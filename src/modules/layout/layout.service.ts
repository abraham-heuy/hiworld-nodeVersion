import { Repository } from 'typeorm';
import { CreateLayoutCommentDto, UpdateLayoutCommentDto } from '../../dtos/layout-comment.dto';
import { CreateLayoutDto, UpdateLayoutDto } from '../../dtos/layout.dto';
import { Layout } from '../../entities/invite.entity';
import { LayoutComment } from '../../entities/layout-comment.entity';
import { NotFoundException, ForbiddenException } from '../../exceptions/HttpExceptions';

export class LayoutService {
  constructor(
    private layoutRepo: Repository<Layout>,
    private layoutCommentRepo: Repository<LayoutComment>,
    // private userRepo: Repository<User>
  ) {}

  // ========== LAYOUT CRUD ==========
  async createLayout(authorId: string, dto: CreateLayoutDto): Promise<Layout> {
    const layout = this.layoutRepo.create({
      title: dto.title,
      text: dto.text,
      code: dto.code,
      author: authorId,
      date: new Date(),
    });
    return this.layoutRepo.save(layout);
  }

  async getAllLayouts(limit = 20, offset = 0): Promise<Layout[]> {
    return this.layoutRepo.find({
      order: { date: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getLayoutById(id: string): Promise<Layout> {
    const layout = await this.layoutRepo.findOne({ where: { id } });
    if (!layout) throw new NotFoundException('Layout not found');
    return layout;
  }

  async getLayoutsByUser(userId: string, limit = 20, offset = 0): Promise<Layout[]> {
    return this.layoutRepo.find({
      where: { author: userId },
      order: { date: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async updateLayout(layoutId: string, userId: string, dto: UpdateLayoutDto): Promise<Layout> {
    const layout = await this.layoutRepo.findOne({ where: { id: layoutId } });
    if (!layout) throw new NotFoundException('Layout not found');
    if (layout.author !== userId) throw new ForbiddenException('You can only edit your own layouts');
    if (dto.title !== undefined) layout.title = dto.title;
    if (dto.text !== undefined) layout.text = dto.text;
    if (dto.code !== undefined) layout.code = dto.code;
    return this.layoutRepo.save(layout);
  }

  async deleteLayout(layoutId: string, userId: string, isAdmin = false): Promise<void> {
    const layout = await this.layoutRepo.findOne({ where: { id: layoutId } });
    if (!layout) throw new NotFoundException('Layout not found');
    if (layout.author !== userId && !isAdmin) throw new ForbiddenException('You cannot delete this layout');
    await this.layoutRepo.remove(layout);
  }

  // ========== COMMENTS ==========
  async addComment(layoutId: string, authorId: string, dto: CreateLayoutCommentDto): Promise<LayoutComment> {
    const layout = await this.layoutRepo.findOne({ where: { id: layoutId } });
    if (!layout) throw new NotFoundException('Layout not found');
    const comment = this.layoutCommentRepo.create({
      layoutId,
      author: authorId,
      text: dto.text,
      date: new Date(),
    });
    return this.layoutCommentRepo.save(comment);
  }

  async getComments(layoutId: string, limit = 20, offset = 0): Promise<LayoutComment[]> {
    return this.layoutCommentRepo.find({
      where: { layoutId },
      order: { date: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async updateComment(commentId: string, userId: string, dto: UpdateLayoutCommentDto): Promise<LayoutComment> {
    const comment = await this.layoutCommentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author !== userId) throw new ForbiddenException('You can only edit your own comments');
    comment.text = dto.text;
    return this.layoutCommentRepo.save(comment);
  }

  async deleteComment(commentId: string, userId: string, isAdmin = false): Promise<void> {
    const comment = await this.layoutCommentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author !== userId && !isAdmin) throw new ForbiddenException('Cannot delete this comment');
    await this.layoutCommentRepo.remove(comment);
  }
}