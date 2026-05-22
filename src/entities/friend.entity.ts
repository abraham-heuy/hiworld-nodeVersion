import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('friends')
export class Friend {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  sender!: string;

  @Column({ length: 255 })
  receiver!: string;

  @Column({ default: 'PENDING' })
  status!: string;
}