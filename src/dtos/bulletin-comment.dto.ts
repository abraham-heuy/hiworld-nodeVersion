import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class CreateBulletinCommentDto {
  @IsString()
  @MaxLength(500)
  text!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateBulletinCommentDto {
  @IsString()
  @MaxLength(500)
  text!: string;
}