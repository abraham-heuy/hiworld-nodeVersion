import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('bulletincomments')
export class BulletinComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'bulletin_id' })
  bulletinId!: string;  // stores UUID of the bulletin

  @Column({ name: 'parent_id', nullable: true, type: 'uuid' })
  parentId?: string | null;

  @Column({ length: 255 })
  author!: string; // user ID

  @Column({ length: 500 })
  text!: string;

  @CreateDateColumn({ type: 'datetime' })
  date!: Date;
}