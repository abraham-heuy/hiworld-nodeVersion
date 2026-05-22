import { IsString, IsOptional, IsEmail, IsUUID } from 'class-validator';
import { LoginDto } from './other.dto';

export class AdminLoginDto extends LoginDto {
  @IsOptional()
  @IsString()
  totpCode?: string;
}

export class Setup2FADto {
  @IsString()
  totpCode!: string;
}

export class AdminActionDto {
  @IsUUID()
  targetUserId!: string;

  @IsString()
  action!: 'activate' | 'deactivate' | 'promote' | 'demote';
}

export class CreateAdminDto {
  @IsUUID()
  userId!: string;

  @IsString()
  role?: string;

  @IsEmail()
  @IsOptional()
  recoveryEmail?: string;
}