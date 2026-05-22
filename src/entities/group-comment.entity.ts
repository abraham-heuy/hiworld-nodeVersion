import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Group } from './group.entity';

@Entity('groupcomments')
export class GroupComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'group_id' })
  groupId!: string;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'group_id' })
  group?: Group;

  @Column({ length: 255 })
  author!: string; // user ID (string)

  @Column({ length: 500 })
  text!: string;

  @Column({ type: 'datetime' })
  date!: Date;
}