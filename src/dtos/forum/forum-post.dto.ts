import { IsString } from 'class-validator';

export class CreateForumPostDto {
  @IsString()
  content!: string;
}

export class UpdateForumPostDto {
  @IsString()
  content!: string;
}