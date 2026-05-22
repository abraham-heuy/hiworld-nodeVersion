import { IsString, IsOptional, IsBoolean, IsObject, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsObject()
  interests?: {
    General?: string;
    Music?: string;
    Movies?: string;
    Television?: string;
    Books?: string;
    Heroes?: string;
  };

  @IsOptional()
  @IsString()
  music?: string; // filename

  @IsOptional()
  @IsString()
  pfp?: string; // filename

  @IsOptional()
  @IsString()
  css?: string; // custom CSS/HTML

  @IsOptional()
  @IsString()
  @MaxLength(255)
  status?: string;

  @IsOptional()
  @IsBoolean()
  private?: boolean;
}

export class ProfileResponseDto {
  id!: string;
  username!: string;
  bio!: string;
  interests!: Record<string, string>;
  music!: string;
  pfp!: string;
  status!: string;
  private!: boolean;
  views!: number;
  date!: Date;
  lastactive!: Date;
  // optionally include custom CSS if owner or friend
  css?: string;
}