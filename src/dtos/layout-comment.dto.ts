import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateLayoutCommentDto {
  @IsUUID()
  layoutId!: string;

  @IsString()
  @MaxLength(500)
  text!: string;
}

export class UpdateLayoutCommentDto {
  @IsString()
  @MaxLength(500)
  text!: string;
}