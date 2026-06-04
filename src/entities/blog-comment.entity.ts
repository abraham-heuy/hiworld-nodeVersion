import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('blogcomments')
export class BlogComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'blog_id' })
  blogId!: string;

  @Column({ name: 'parent_id', nullable: true, type: 'uuid' })
  parentId?: string | null;

  @Column({ length: 255 })
  author!: string;

  @Column({ length: 500 })
  text!: string;

  @CreateDateColumn({ type: 'timestamp' })
  date!: Date;
}