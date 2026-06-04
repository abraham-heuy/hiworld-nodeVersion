import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('layoutcomments')
export class LayoutComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'layout_id' })
  layoutId!: string; // UUID of the layout

  @Column({ length: 255 })
  author!: string; // user ID

  @Column({ length: 500 })
  text!: string;

  @CreateDateColumn({ type: 'timestamp' })
  date!: Date;
}