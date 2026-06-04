import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'sender_id' })
  senderId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender?: User;

  @Column({ name: 'receiver_id' })
  receiverId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiver_id' })
  receiver?: User;

  @Column({ type: 'text' })
  msg!: string;

  @Column({ default: false })
  is_read!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}