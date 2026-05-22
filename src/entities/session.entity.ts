import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'session_id', length: 16 })
  sessionId!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ length: 50 })
  user!: string;

  @CreateDateColumn({ name: 'last_logon', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastLogon!: Date;

  @Column({ name: 'last_activity', type: 'timestamp', default: () => '0000-00-00 00:00:00' })
  lastActivity!: Date;

  @Column({ default: false })
  active!: boolean;
}