import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    
    JoinColumn,
    OneToOne,
  } from 'typeorm';
  import { User } from './user.entity';
  
  @Entity('admins')
  export class Admin {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    // Relation to the actual user account (one-to-one)
    @OneToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user!: User;
  
    @Column({ name: 'user_id' })
    userId!: string;
  
    // Admin role hierarchy: super_admin, moderator, support, etc.
    @Column({ length: 50, default: 'moderator' })
    role!: string;
  
    // Multiple verification methods stored as JSON
    // Example: { "password": true, "totp": true, "backup_codes": true, "email": true }
    @Column({ type: 'json', default: {} })
    verification_methods!: Record<string, boolean>;
  
    // TOTP secret for 2FA (if enabled)
    @Column({ nullable: true })
    totp_secret?: string;
  
    // Encrypted backup codes (JSON array)
    @Column({ type: 'json', nullable: true })
    backup_codes?: string[];
  
    // Is email verified for admin actions?
    @Column({ default: false })
    email_verified!: boolean;
  
    // Recovery email address (different from primary)
    @Column({ nullable: true })
    recovery_email?: string;
  
    // Track login attempts for security
    @Column({ default: 0 })
    failed_login_attempts!: number;
  
    @Column({ type: 'datetime', nullable: true })
    last_failed_attempt?: Date | null;
  
    @Column({ type: 'datetime', nullable: true })
    last_login?: Date | null;
  
    @Column({ type: 'datetime', nullable: true })
    last_logout?: Date | null;
  
    // IP address logging (last known)
    @Column({ nullable: true })
    last_ip?: string;
  
    // Is admin account active? (allow temporary deactivation)
    @Column({ default: true })
    is_active!: boolean;
  
    // Optional: session token for current session
    @Column({ nullable: true })
    current_session_token?: string;
  
    @CreateDateColumn({ type: 'datetime' })
    created_at!: Date;
  
    @UpdateDateColumn({ type: 'datetime' })
    updated_at!: Date;
  }