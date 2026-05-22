// ==================== AUTH DTOs ====================
import { IsEmail, IsString, MinLength, IsOptional, IsUUID, IsBoolean, IsInt, Max, Min } from 'class-validator';

export class SignupDto {
  @IsString()
  @MinLength(3)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsOptional()
  inviteCode?: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

//blog dto!
export class CreateBlogDto {
  @IsString()
  title!: string;

  @IsString()
  text!: string;

  @IsInt()
  @Min(0)
  @Max(2)
  privacyLevel!: number;

  @IsUUID()
  categoryId!: string;

  @IsBoolean()
  @IsOptional()
  pinned?: boolean;
}

export class UpdateBlogDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  privacyLevel?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}

export class GetBlogsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsString()
  sort?: 'date' | 'kudos' = 'date';
}
// ==================== BULLETIN DTOs ====================
export class CreateBulletinDto {
  @IsString()
  title!: string;

  @IsString()
  text!: string;
}

// ==================== FRIEND DTOs ====================
export class SendFriendRequestDto {
  @IsUUID()
  receiverId!: string;
}

export class RespondToFriendRequestDto {
  @IsUUID()
  requestId!: string;

  @IsString()
  status!: 'ACCEPTED' | 'REJECTED';
}

// ==================== INVITE DTOs ====================
export class GenerateInviteDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  count?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  expiresDays?: number;
}