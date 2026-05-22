import { IsString, IsOptional, IsBoolean, IsUUID, MaxLength } from 'class-validator';

export class CreateForumTopicDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  slug!: string;

  @IsString()
  content!: string;

  @IsUUID()
  categoryId!: string;
}

export class UpdateForumTopicDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;
}

export class GetTopicsQueryDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 20;
}