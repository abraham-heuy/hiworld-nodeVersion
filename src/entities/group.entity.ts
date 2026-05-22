import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 500 })
  description!: string;

  @Column({ length: 255 })
  author!: string; // user ID

  @CreateDateColumn({ type: 'datetime' })
  date!: Date;

  @Column({ type: 'text' })
  members!: string; // JSON array of user IDs

  @Column({ type: 'text', nullable: true })
  layout?: string; // custom HTML/CSS layout

  @Column({ type: 'json', nullable: true })
  settings?: Record<string, any>; // e.g., { banner: "url", theme: "dark" }

  @Column({ default: true })
  is_active!: boolean; // if false, group is banned/hidden

  @Column({ default: 0 })
  reports_count!: number;
}