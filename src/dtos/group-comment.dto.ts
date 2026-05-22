import { IsString, IsOptional, MaxLength, IsArray, IsUUID } from 'class-validator';

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
  initialMembers?: string[]; // usernames or ids
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
}

export class AddGroupMemberDto {
  @IsUUID()
  userId!: string;
}


export class CreateGroupCommentDto {
  @IsString()
  @MaxLength(500)
  text!: string;
}

export class UpdateGroupCommentDto {
  @IsString()
  @MaxLength(500)
  text!: string;
}