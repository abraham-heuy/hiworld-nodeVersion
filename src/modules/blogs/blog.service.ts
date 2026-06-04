import { Repository, In } from 'typeorm';
import { CreateBlogCommentDto, UpdateBlogCommentDto } from '../../dtos/blog-comment.dto';
import { CreateBlogDto, GetBlogsQueryDto, UpdateBlogDto } from '../../dtos/other.dto';
import { BlogComment } from '../../entities/blog-comment.entity';
import { Blog } from '../../entities/blog.entity';
import { Category } from '../../entities/category.entity';
import { Friend } from '../../entities/friend.entity';
import { User } from '../../entities/user.entity';
import { BadRequestException, NotFoundException, ForbiddenException } from '../../exceptions/HttpExceptions';

export class BlogService {
  constructor(
    private blogRepo: Repository<Blog>,
    private blogCommentRepo: Repository<BlogComment>,
    private categoryRepo: Repository<Category>, // only used for validation
    private userRepo: Repository<User>,
    private friendRepo: Repository<Friend>
  ) {}

  // ========== CATEGORIES ==========
  async getCategories(): Promise<Category[]> {
    return this.categoryRepo.find({ where: { is_active: true } });
  }

  // ========== BLOG CRUD ==========
  async createBlog(authorId: string, dto: CreateBlogDto): Promise<Blog> {
    // Validate category exists
    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category) throw new BadRequestException('Invalid category');
    
    const blog = this.blogRepo.create({
      title: dto.title,
      text: dto.text,
      author: authorId,
      category: dto.categoryId, // store the category ID string directly
      privacyLevel: dto.privacyLevel,
      pinned: dto.pinned || false,
      date: new Date(),
    });
    return this.blogRepo.save(blog);
  }

  async getBlogs(viewerId: string | undefined, query: GetBlogsQueryDto): Promise<{ blogs: Blog[]; total: number }> {
    const { page = 1, limit = 20, categoryId, authorId, sort = 'date' } = query;
    const skip = (page - 1) * limit;
  
    let friendIds: string[] = [];
  
    if (viewerId) {
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
      friendIds = friendUsers.map(u => u.id);
    }
  
    const blogQuery = this.blogRepo.createQueryBuilder('blog')
      .where('blog.privacyLevel = 0');
  
    if (viewerId) {
      blogQuery.orWhere('blog.author = :viewerId', { viewerId });
      if (friendIds.length) {
        blogQuery.orWhere('(blog.privacyLevel = 1 AND blog.author IN (:...friendIds))', { friendIds });
      }
    }
  
    if (categoryId) {
      blogQuery.andWhere('blog.category = :categoryId', { categoryId });
    }
    if (authorId) {
      blogQuery.andWhere('blog.author = :authorId', { authorId });
    }
  
    blogQuery.orderBy(`blog.${sort}`, 'DESC').skip(skip).take(limit);
  
    const [blogs, total] = await blogQuery.getManyAndCount();
    return { blogs, total };
  }
  async getBlogById(blogId: string, viewerId?: string): Promise<Blog> {
    const blog = await this.blogRepo.findOne({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Blog not found');

    // Check privacy
    if (blog.privacyLevel === 2 && blog.author !== viewerId) {
      throw new ForbiddenException('This blog is private');
    }
    if (blog.privacyLevel === 1 && blog.author !== viewerId) {
      // Check if viewer is friend with author
      const isFriend = await this.friendRepo.findOne({
        where: [
          { sender: viewerId, receiver: blog.author, status: 'ACCEPTED' },
          { sender: blog.author, receiver: viewerId, status: 'ACCEPTED' }
        ]
      });
      if (!isFriend) throw new ForbiddenException('This blog is only visible to friends');
    }
    return blog;
  }

  async updateBlog(blogId: string, userId: string, dto: UpdateBlogDto): Promise<Blog> {
    const blog = await this.blogRepo.findOne({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.author !== userId) throw new ForbiddenException('You can only edit your own blogs');
    
    if (dto.title !== undefined) blog.title = dto.title;
    if (dto.text !== undefined) blog.text = dto.text;
    if (dto.privacyLevel !== undefined) blog.privacyLevel = dto.privacyLevel;
    if (dto.categoryId !== undefined) {
      // Validate category exists
      const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new BadRequestException('Invalid category');
      blog.category = dto.categoryId;
    }
    if (dto.pinned !== undefined) blog.pinned = dto.pinned;
    
    return this.blogRepo.save(blog);
  }

  async deleteBlog(blogId: string, userId: string): Promise<void> {
    const blog = await this.blogRepo.findOne({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.author !== userId) throw new ForbiddenException('You can only delete your own blogs');
    await this.blogRepo.remove(blog);
  }

  async giveKudos(blogId: string, _userId: string): Promise<void> {
    const blog = await this.blogRepo.findOne({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Blog not found');
    blog.kudos += 1;
    await this.blogRepo.save(blog);
  }

  // ========== COMMENTS ==========
  async addComment(blogId: string, authorId: string, dto: CreateBlogCommentDto): Promise<BlogComment> {
    const blog = await this.blogRepo.findOne({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.privacyLevel === 2 && blog.author !== authorId) 
      throw new ForbiddenException('Cannot comment on private blog');
    
    const comment = this.blogCommentRepo.create({
      blogId,
      author: authorId,
      text: dto.text,
      parentId: dto.parentId || null,
      date: new Date(),
    });
    return this.blogCommentRepo.save(comment);
  }

  async getComments(blogId: string, limit = 20, offset = 0): Promise<BlogComment[]> {
    return this.blogCommentRepo.find({
      where: { blogId },
      order: { date: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async updateComment(commentId: string, userId: string, dto: UpdateBlogCommentDto): Promise<BlogComment> {
    const comment = await this.blogCommentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author !== userId) throw new ForbiddenException('You can only edit your own comments');
    comment.text = dto.text;
    return this.blogCommentRepo.save(comment);
  }

  async deleteComment(commentId: string, userId: string, isAdmin = false): Promise<void> {
    const comment = await this.blogCommentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author !== userId && !isAdmin) throw new ForbiddenException('You cannot delete this comment');
    await this.blogCommentRepo.remove(comment);
  }
}