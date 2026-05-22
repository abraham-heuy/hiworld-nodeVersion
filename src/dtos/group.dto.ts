import { IsString, IsOptional, MaxLength, IsArray, IsUUID, IsObject } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  initialMembers?: string[]; // user IDs
}

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  layout?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class AddGroupMemberDto {
  @IsUUID()
  userId!: string;
}

export class ReportGroupDto {
  @IsString()
  reason!: string;
}