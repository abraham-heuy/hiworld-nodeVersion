import { IsString, IsUUID, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateProfileCommentDto {
  @IsUUID()
  profileOwnerId!: string; // the user whose profile is being commented on

  @IsString()
  @MaxLength(500)
  text!: string;

  @IsOptional()
  @IsInt()
  parentId?: number;
}

export class UpdateProfileCommentDto {
  @IsString()
  @MaxLength(500)
  text!: string;
}