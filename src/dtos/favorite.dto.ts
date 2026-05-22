import { IsString, IsIn } from 'class-validator';

export class AddFavoriteDto {
  @IsString()
  itemId!: string;

  @IsString()
  @IsIn(['blog', 'user', 'layout'])
  type!: 'blog' | 'user' | 'layout';
}

export class RemoveFavoriteDto {
  @IsString()
  itemId!: string;

  @IsString()
  @IsIn(['blog', 'user', 'layout'])
  type!: 'blog' | 'user' | 'layout';
}