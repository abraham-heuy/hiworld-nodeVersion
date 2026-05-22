import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateBlogCommentDto {
  @IsString()
  @MaxLength(500)
  text!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateBlogCommentDto {
  @IsString()
  @MaxLength(500)
  text!: string;
}