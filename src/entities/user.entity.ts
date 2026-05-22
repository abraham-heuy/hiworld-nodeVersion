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

  @Column({ type: 'datetime' })
  date!: Date;

  @Column({ type: 'datetime' })
  lastactive!: Date;

  @Column({ type: 'datetime' })
  lastlogon!: Date;

  @Column({ length: 500, default: '' })
  bio!: string;

  @Column({ length: 500, default: ' ' })
  interests!: string;

  @Column({ type: 'blob', nullable: true })
  css?: Buffer | null;

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

  // ========== WAITLIST / INVITE FIELDS ==========
  @Column({ default: false })
  is_active!: boolean;        // can they log in?

  @Column({ default: false })
  is_waitlisted!: boolean;    // signed up without invite

  @Column({ type: 'datetime', nullable: true })
  waitlisted_at?: Date | null;

  @Column({ type: 'int', nullable: true })
  waitlist_position?: number | null;

  @Column({ nullable: true })
  used_invite_id?: string | null;

  @Column({ type: 'datetime', nullable: true })
  activated_at?: Date | null;

  // ========== RELATIONS ==========
  @ManyToOne(() => Invite, { nullable: true })
  @JoinColumn({ name: 'used_invite_id' })
  used_invite?: Invite;
}