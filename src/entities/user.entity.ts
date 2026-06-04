import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Invite } from './invite.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: 0 })
  rank!: number;

  @Column({ length: 255, unique: true })
  username!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ length: 255 })
  password!: string;

  @Column({ type: 'timestamp' })
  date!: Date;

  @Column({ type: 'timestamp' })
  lastactive!: Date;

  @Column({ type: 'timestamp' })
  lastlogon!: Date;

  @Column({ length: 500, default: '' })
  bio!: string;

  @Column({ length: 500, default: ' ' })
  interests!: string;

  // PostgreSQL uses 'bytea' for binary data; but if CSS is text, use 'text'
  @Column({ type: 'text', nullable: true })
  css?: string | null;

  @Column({ length: 255, default: 'default.mp3' })
  music!: string;

  @Column({ length: 255, default: 'default.jpg' })
  pfp!: string;

  @Column({ length: 255, default: 'None' })
  currentgroup!: string;

  @Column({ default: '' })
  status!: string;

  @Column({ default: false })
  private!: boolean;

  @Column({ default: 0 })
  views!: number;

  // Waitlist / Invite fields
  @Column({ default: false })
  is_active!: boolean;

  @Column({ default: false })
  is_waitlisted!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  waitlisted_at?: Date | null;

  @Column({ type: 'int', nullable: true })
  waitlist_position?: number | null;

  @Column({ nullable: true })
  used_invite_id?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  activated_at?: Date | null;

  // Relations
  @ManyToOne(() => Invite, { nullable: true })
  @JoinColumn({ name: 'used_invite_id' })
  used_invite?: Invite;
}