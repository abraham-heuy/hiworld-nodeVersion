import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'session_id', length: 16 })
  sessionId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ length: 50 })
  user!: string;

  @CreateDateColumn({ name: 'last_logon', type: 'timestamp' })
  lastLogon!: Date;

  @Column({ name: 'last_activity', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActivity!: Date;

  @Column({ default: true })
  active!: boolean;
}