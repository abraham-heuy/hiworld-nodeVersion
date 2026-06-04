import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('comments')   // original table name
export class ProfileComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'toid' })
  toId!: number;

  @Column({ name: 'parent_id' })
  parentId!: number;

  @Column({ length: 255 })
  author!: string;

  @Column({ length: 500 })
  text!: string;

  @Column({ type: 'timestamp' })
  date!: Date;
}