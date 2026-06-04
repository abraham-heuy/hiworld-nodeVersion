import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ForumCategory } from './forum-category.entity';
import { User } from '../user.entity';

@Entity('forum_topics')
export class ForumTopic {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'text' })
  content!: string; // first post content

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @Column({ name: 'author_id' })
  authorId!: string;

  @ManyToOne(() => ForumCategory)
  @JoinColumn({ name: 'category_id' })
  category!: ForumCategory;

  @Column({ name: 'category_id' })
  categoryId!: string;

  @Column({ default: 0 })
  viewCount!: number;

  @Column({ default: false })
  isPinned!: boolean;

  @Column({ default: false })
  isLocked!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}