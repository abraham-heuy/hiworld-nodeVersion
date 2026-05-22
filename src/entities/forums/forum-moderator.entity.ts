import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { ForumCategory } from './forum-category.entity';
import { User } from '../user.entity';

@Entity('forum_moderators')
export class ForumModerator {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => ForumCategory)
  @JoinColumn({ name: 'category_id' })
  category!: ForumCategory;

  @Column({ name: 'category_id' })
  categoryId!: string;
}