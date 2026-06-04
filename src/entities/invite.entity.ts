import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('invites')
export class Invite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 32, unique: true })
  code!: string;

  @Column({ default: 'unused' })
  status!: string;

  @Column({ nullable: true })
  used_by_id?: string | null;

  @Column({ nullable: true })
  created_by_id?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expires_at?: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'used_by_id' })
  used_by?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  created_by?: User;
}