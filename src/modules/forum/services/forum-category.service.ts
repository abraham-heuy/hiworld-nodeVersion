import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '../../../exceptions/HttpExceptions';
import { CreateForumCategoryDto, UpdateForumCategoryDto } from '../../../dtos/forum/forum-category.dto';
import { ForumCategory } from '../../../entities/forums/forum-category.entity';

export class ForumCategoryService {
  constructor(private categoryRepo: Repository<ForumCategory>) {}

  async createCategory(dto: CreateForumCategoryDto): Promise<ForumCategory> {
    const existing = await this.categoryRepo.findOneBy({ slug: dto.slug });
    if (existing) throw new ConflictException('Category with this slug already exists');
    const category = this.categoryRepo.create({
      name: dto.name,
      description: dto.description,
      slug: dto.slug,
      sortOrder: dto.sortOrder || 0,
    });
    return this.categoryRepo.save(category);
  }

  async getCategories(): Promise<ForumCategory[]> {
    return this.categoryRepo.find({ order: { sortOrder: 'ASC', createdAt: 'ASC' } });
  }

  async getCategoryById(id: string): Promise<ForumCategory> {
    const category = await this.categoryRepo.findOneBy({ id });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async updateCategory(id: string, dto: UpdateForumCategoryDto): Promise<ForumCategory> {
    const category = await this.getCategoryById(id);
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async deleteCategory(id: string): Promise<void> {
    const result = await this.categoryRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Category not found');
  }
}