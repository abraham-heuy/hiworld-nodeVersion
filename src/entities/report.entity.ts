import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string; // user who filed the report

  @Column({ name: 'creator_id', type: 'uuid' })
  creatorId!: string; // user being reported (or the author of content)

  @CreateDateColumn({ type: 'datetime' })
  date!: Date;

  @Column({ name: 'content_type' })
  contentType!: number; // 1=user, 2=blog, 3=bulletin, 4=group, 5=layout, etc.

  @Column({ name: 'content_id', type: 'uuid' })
  contentId!: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ default: false })
  resolved!: boolean;
}