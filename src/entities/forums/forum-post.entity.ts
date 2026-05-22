import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ForumTopic } from './forum-topic.entity';
import { User } from '../user.entity';

@Entity('forum_posts')
export class ForumPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @Column({ name: 'author_id' })
  authorId!: string;

  @ManyToOne(() => ForumTopic)
  @JoinColumn({ name: 'topic_id' })
  topic!: ForumTopic;

  @Column({ name: 'topic_id' })
  topicId!: string;

  @Column({ default: false })
  isFirstPost!: boolean;

  @Column({ default: 0 })
  votes!: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}