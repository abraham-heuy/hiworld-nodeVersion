import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateLayoutDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  text!: string; // description

  @IsString()
  code!: string; // CSS/HTML blob as string
}

export class UpdateLayoutDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  code?: string;
}