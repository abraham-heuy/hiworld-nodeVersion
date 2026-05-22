import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  interests?: string;

  @IsString()
  @IsOptional()
  css?: string;

  @IsString()
  @IsOptional()
  music?: string;

  @IsString()
  @IsOptional()
  pfp?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  status?: string;

  @IsBoolean()
  @IsOptional()
  private?: boolean;
}

export class UserResponseDto {
  id!: string;
  username!: string;
  bio!: string;
  interests!: string;
  music!: string;
  pfp!: string;
  status!: string;
  views!: number;
  date!: Date;
  lastactive!: Date;
}